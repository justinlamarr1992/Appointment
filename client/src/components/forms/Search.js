import React, { useState } from "react";
import { DatePicker, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import AlgoliaPlaces from "algolia-places-react";
import AutoComplete from "react-google-autocomplete";
import moment from "moment";
import { useNavigate } from "react-router-dom";

// destructure values from ant componnents
const { RangePicker } = DatePicker;
const { Option } = Select;

const config = process.env.REACT_APP_GOOGLE_API_KEY;
// const config = {
//   appId: process.env.REACT_APP_ALGOLIA_APP_ID,
//   apiKey: process.env.REACT_APP_ALGOLIA_API_KEY,
//   language: "en",
// };

const Search = () => {
  //state
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [bed, setBed] = useState("");
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate(`/search-result?location=${location}&date=${date}&bed=${bed}`);
  };

  return (
    <div className="d-flex pb-4">
      {/* chage so this div only wraps Algolia/google */}
      <div className="w-100">
        {/* <AlgoliaPlaces
          placeholder="Location"
          defaultValue={location}
          options={config}
          onChange={({ suggestion }) => setLocation(suggestion.value)}
          //   style={{ style: "50px" }}
        /> */}

        <AutoComplete
          className="form-control"
          placeholder="Location"
          apiKey={config}
          onPlaceSelected={(place) => setLocation(place.formatted_address)}
          style={{ height: "50px" }}
        />
      </div>
      <RangePicker
        onChange={(value, dateString) => setDate(dateString)}
        disabledDate={(current) =>
          current && current.valueOf() < moment().subtract(1, "days")
        }
        className="w-100"
      />
      <Select
        onChange={(value) => setBed(value)}
        className="w-100"
        size="large"
        placeholder="Number of Beds"
      >
        <Option key={1}>{1}</Option>
        <Option key={2}>{2}</Option>
        <Option key={3}>{3}</Option>
        <Option key={4}>{4}</Option>
      </Select>
      <SearchOutlined
        onClick={handleSubmit}
        className="btn btn-primary p-3 btn-square"
      />
    </div>
  );
};

export default Search;
