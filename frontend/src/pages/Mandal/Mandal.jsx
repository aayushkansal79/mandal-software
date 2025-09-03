import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const MandalForm = ({ url }) => {
  const [mandals, setMandals] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const token = localStorage.getItem("token");

  const fetchMandals = async () => {
    try {
      const { data } = await axios.get(`${url}/api/mandal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMandals(data);
    } catch (err) {
      toast.error("Failed to fetch mandals");
    }
  };

  useEffect(() => {
    fetchMandals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${url}/api/mandal`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Mandal added successfully");
      setFormData({ name: "", code: "" });
      fetchMandals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add mandal");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Add Mandal</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-4 rounded shadow max-w-md"
      >
        <div className="mb-3">
          <label className="block mb-1">Mandal Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border px-2 py-1 w-full rounded"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Mandal Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="border px-2 py-1 w-full rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-success text-white px-3 py-1 rounded"
        >
          Add Mandal
        </button>
      </form>

      <h3 className="text-lg font-semibold mt-6">Existing Mandals</h3>
      <table className="w-full border mt-2">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Code</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {mandals.map((m) => (
            <tr key={m._id}>
              <td className="border px-2 py-1">{m.name}</td>
              <td className="border px-2 py-1">{m.code}</td>
              <td className="border px-2 py-1">
                {m.status ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MandalForm;
