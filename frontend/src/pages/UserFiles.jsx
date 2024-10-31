import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UserFiles = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = Cookies.get("jwt");
    const api = `http://localhost:4000/admin/files/82fae2b08891f8cd384484ba3fd37d99.pdf`;
    axios
      .get(api, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div>
      <h1>User Files</h1>
      <ul>
        {/* {data.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))} */}
      </ul>
    </div>
  );
};

export default UserFiles;
