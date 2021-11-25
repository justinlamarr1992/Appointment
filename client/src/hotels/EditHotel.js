import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DatePicker, Select } from "antd";
import { read } from "../actions/hotel";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const { Option } = Select;

const EditHotel = () => {
  const { hotelId } = useParams();
  useEffect(() => {
    loadSellerHotel();
  }, []);
  const loadSellerHotel = async () => {
    console.log(hotelId);
    let res = await read(hotelId);
    console.log(res);
  };
  return (
    <>
      <div className="container-fluid bg-secondary p-5 text-center">
        <h2>Edit Hotel</h2>
        <h2>test hotelId : {hotelId}</h2>
      </div>
    </>
  );
};

export default EditHotel;
