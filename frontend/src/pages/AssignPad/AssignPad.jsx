import React, { useEffect, useState } from "react";
import "./AssignPad.css";
import Select from "react-select";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";

const AssignPad = ({ url }) => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [padNumbers, setPadNumbers] = useState([""]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${url}/api/user/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(
          res.data.map((member) => ({
            label: member.memberName,
            value: member._id,
          }))
        );
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [url]);

  // Handle pad number change
  const handlePadChange = (index, value) => {
    const updatedPads = [...padNumbers];
    updatedPads[index] = value;

    if (index === padNumbers.length - 1 && value.trim() !== "") {
      updatedPads.push("");
    }

    setPadNumbers(updatedPads);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filteredPads = padNumbers.filter((pad) => pad.trim() !== "");
      await axios.post(
        `${url}/api/receiptbook/assign`,
        {
          memberId: selectedMember?.value,
          padNumbers: filteredPads,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Pads assigned successfully!");
      setPadNumbers([""]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning pads");
      console.error("Error assigning pads:", err);
    } finally {
      setLoading(false);
    }
  };

  const [pads, setPads] = useState([]);

  useEffect(() => {
    const fetchPads = async () => {
      try {
        const res = await axios.get(`${url}/api/receiptbook/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPads(res.data);
      } catch (err) {
        console.error("Error fetching pads:", err);
      }
    };
    fetchPads();
  }, [url]);

  return (
    <>
      <div className="bread">Assign Pad</div>

      <form
        className="addreceipt g-3 my-3 mx-1 rounded"
        onSubmit={handleSubmit}
      >
        <div className="row">
          <div className="col-md-3">
            <label className="form-label">Member Name</label>
            <Select
              options={members}
              value={selectedMember}
              onChange={setSelectedMember}
              placeholder="Select Member"
              className="basic-single-select"
              classNamePrefix="select"
            />
          </div>
        </div>

        <label className="form-label mt-3">Pad Number</label>
        <div className="row mb-2 align-items-center g-2 pb-2">
          {padNumbers.map((pad, index) => (
            <div key={index} className="col-md-3 col-6">
              <input
                type="number"
                className="form-control"
                placeholder="Enter Pad No."
                value={pad}
                onChange={(e) => handlePadChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Assign Pads
          </button>
        </div>
      </form>

      <div className="AssignPad rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-success">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Pad Number</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {pads.map((pad, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <td>{pad.memberName}</td>
                <th className="text-danger">{pad.pads.join(", ")}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default AssignPad;
