import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { stripeSuccessRequest } from "../actions/stripe";
// this
import { LoadingOutlined } from "@ant-design/icons";

const StripeSuccess = () => {
  const {
    auth: { token },
  } = useSelector((state) => ({ ...state }));
  const { hotelId } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    // console.log("Send this hotelid to back end to create order", hotelId);
    stripeSuccessRequest(token, hotelId).then((res) => {
      if (res.data.success) {
        // console.log("stripe success response", res.data);
        navigate("/dashboard");
      } else {
        navigate("/stripe/cancel");
      }
    });
  }, [hotelId]);

  return (
    <div className="container">
      <div className="col text-center">
        {/* change this */}
        <LoadingOutlined className="display-1 text-danger p-5" />{" "}
      </div>
    </div>
  );
};

export default StripeSuccess;
