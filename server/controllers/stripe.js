import User from "../models/user";
import Stripe from "stripe";
import queryString from "query-string";
import Hotel from "../models/hotel";
// this
import Order from "../models/order";

const stripe = Stripe(process.env.STRIPE_SECRET);

export const createConnectAccount = async (req, res) => {
  //1. fid user from db
  const user = await User.findById(req.user._id).exec();
  console.log("USER ===>", user);
  //2. if user dont have stripe_account_id yet, create now
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: "express",
    });
    console.log("ACCOUNT ===> ", account);
    user.stripe_account_id = account.id;
    user.save();
  }
  //3. create login account link based on account id (for frontend to complete onboarding)
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    // write down new enty in env
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });
  // prefill any user info such as email
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  //   console.log("ACCOUNT LINK", accountLink);
  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  console.log("LOGIN LINK", link);
  res.send(link);
  //4. update payment schedule (optional. default is 2 days)
};

const updateDelayedDays = async (accountId) => {
  const account = await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          delay_days: 7,
        },
      },
    },
  });
  return account;
};

export const getAccountStatus = async (req, res) => {
  // console.log("GET ACCOUNT STATUS");
  const user = await User.findById(req.user._id).exec();
  const account = await stripe.accounts.retrieve(user.stripe_account_id);
  // console.log("USER ACCOUNT RETRIEVED", account);
  //update delayed days
  const updatedAccount = await updateDelayedDays(account.id);

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      // change stripe seller to updated Account
      stripe_seller: updatedAccount,
    },
    { new: true }
  )
    .select("-password")
    // sends all but password
    .exec();
  // console.log(updatedUser);
  res.json(updatedUser);
};

export const getAccountBalance = async (req, res) => {
  const user = await User.findById(req.user._id).exec();
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    // console.log("BALANCE ===>", balance);
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};

export const payoutSetting = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();

    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    );
    // console.log("LOGIN LINK FOR PAYOUT SETTING", loginLink);
    res.json(loginLink);
  } catch (err) {
    console.log("STRIPE PAYOUT SETTING ERR ", err);
  }
};

export const stripeSessionId = async (req, res) => {
  // console.log("you hit stripe session id", req.body.hotelId);
  // 1 get hotel id from req.body
  const { hotelId } = req.body;
  // 2 find the hotel based on hotelId from database
  const item = await Hotel.findById(hotelId).populate("postedBy").exec();
  // 3 20% charge as application fee
  const fee = (item.price * 20) / 100;
  // 4 create a session (move the const session into this)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    // 5 purchasing item details, it will be shown in checkout
    // this change hard coded to dynamics
    line_items: [
      {
        name: item.title,
        amount: item.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
    // 6 create payment intent with application fee and destoinatio charge %80
    // change fee and destionation
    payment_intent_data: {
      application_fee_amount: fee * 100,
      // seller can see his balance his balance in our front end dashboard
      transfer_data: {
        destination: item.postedBy.stripe_account_id,
      },
    },
    // success and cancel urls
    success_url: `${process.env.STRIPE_SUCCESS_URL}/${item._id}`,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });
  // 7 add this ession object to user in the db
  await User.findByIdAndUpdate(req.user._id, { stripeSession: session }).exec();
  // 8 send session id as a response to front end
  res.send({
    sessionId: session.id,
  });

  // console.log("SESSION ===>", session);
};

export const stripeSuccess = async (req, res) => {
  try {
    // 1 het hotel id from req.body
    const { hotelId } = req.body;
    // 2 find current logged in user
    const user = await User.findById(req.user._id).exec();
    // check if user has stripeSession
    if (!user.stripeSession) return;
    // 3 retrieve stripe session previously saved in database
    const session = await stripe.checkout.sessions.retrieve(
      user.stripeSession.id
    );
    // 4 if session payment status is paid, create order
    if (session.payment_status === "paid") {
      // 5 check if order with id already exist by querying order collections
      const orderExist = await Order.findOne({
        "session.id": session.id,
      }).exec();
      if (orderExist) {
        // 6 if order exist send success true
        res.json({ success: true });
      } else {
        // 7 else create new order and send success true
        let newOrder = await new Order({
          hotel: hotelId,
          session,
          orderedBy: user._id,
        }).save();
        // 8 remove users stripeSession
        await User.findByIdAndUpdate(user._id, {
          $set: { stripeSession: {} },
        });
        res.json({ success: true });
      }
    }
  } catch (err) {
    console.log("STRIPE SUCCESS ERR", err);
  }
};
