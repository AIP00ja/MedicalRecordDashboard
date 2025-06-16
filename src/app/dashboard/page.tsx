"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [gender, setGender] = useState("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [profileImagePath, setProfileImagePath] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);


  const api = "http://localhost:5253"; // Change this to your Render URL later

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      window.location.href = "/login";
    } else {
      fetch(`${api}/api/auth/get-user/${email}`)
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setGender(data.gender || "Male");
          setPhoneNumber(data.phoneNumber || "");
          setFullName(data.fullName || "");
          setProfileImagePath(`${api}${data.profileImagePath}`);
        });

      fetch(`${api}/api/auth/files/${email}`)
        .then((res) => res.json())
        .then((data) => setUploadedFiles(data));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !fileName || !fileType || !user?.email) {
      alert("Please complete all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${api}/api/auth/upload`, {
      method: "POST",
      body: formData,
    });
    const fileData = await res.json();

    const metaRes = await fetch(`${api}/api/auth/upload-metadata`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        fileType,
        fileUrl: fileData.fileUrl,
        uploadedByEmail: user.email,
      }),
    });

    const saved = await metaRes.json();
    setUploadedFiles((prev) => [...prev, saved]);
    setFile(null);
    setFileName("");
    setFileType("");
  };

  const handleProfileUpdate = async () => {
    if (!user?.email) return;

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("fullName", fullName);
    formData.append("gender", gender);
    formData.append("phoneNumber", phoneNumber);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    const res = await fetch(`${api}/api/auth/update-profile`, {
      method: "PUT",
      body: formData,
    });

    const updated = await res.json();
    alert("Profile updated.");
    setUser(updated);
    if (updated.profileImagePath) {
      setProfileImagePath(`${api}${updated.profileImagePath}`);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`${api}/api/auth/file/${id}`, { method: "DELETE" });
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  return (
    
    <div className="min-h-screen bg-blue-100 p-6 pt-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
{/* Top Header */}
{/* Header */}
<div className="fixed top-0 left-0 right-0 z-50 bg-white shadow px-6 py-3 flex items-center justify-between">
  <div className="text-xl font-bold text-blue-700">HFiles</div>

  <div className="relative">
    <img
      src={
        profileImage
          ? URL.createObjectURL(profileImage)
          : profileImagePath || "/default-avatar.png"
      }
      alt="Profile"
      className="w-10 h-10 rounded-full object-cover cursor-pointer border"
      onClick={() => setShowDropdown(!showDropdown)}
    />
    {showDropdown && (
      <div className="absolute right-0 mt-2 w-24 bg-white rounded shadow-md border z-10">
        
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    )}
  </div>
</div>


        {/* Profile Card */}
        <div className="bg-blue-50 rounded-xl p-6 shadow border relative">
          <div className="absolute top-2 right-2 text-xs bg-white px-3 py-1 rounded-full border font-mono text-gray-600">
            FH547GCV76B
          </div>
          <div className="flex items-center space-x-4">
            <img
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : profileImagePath || "/default-avatar.png"
              }
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <input
                className="text-xl font-semibold mb-1 bg-transparent outline-none"
                value={fullName || ""}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                type="email"
                className="block text-sm bg-transparent outline-none text-gray-600"
                value={user?.email || ""}
                disabled
              />
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setProfileImage(file);
            }}
            className="mt-3 text-sm"
          />

          <div className="mt-4">
            <label className="text-sm">Phone</label>
            <input
              type="text"
              value={phoneNumber || ""}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border rounded px-3 py-1 mt-1"
            />
          </div>

          <div className="mt-3">
            <label className="text-sm block mb-1">Gender</label>
            <label className="mr-4">
              <input
                type="radio"
                value="Male"
                checked={gender === "Male"}
                onChange={(e) => setGender(e.target.value)}
              />{" "}
              Male
            </label>
            <label>
              <input
                type="radio"
                value="Female"
                checked={gender === "Female"}
                onChange={(e) => setGender(e.target.value)}
              />{" "}
              Female
            </label>
          </div>

          <button
            onClick={handleProfileUpdate}
            className="mt-4 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded font-semibold"
          >
            Save
          </button>
        </div>

        {/* Upload Form */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">
            Please Add Your Medical Records
          </h2>

          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
          >
            <option value="">Select file type</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Prescription">Prescription</option>
            <option value="X-Ray">X-Ray</option>
            <option value="MRI">MRI</option>
          </select>

          <input
            type="text"
            placeholder="Enter Name of File..."
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded mb-3"
          />

          <button
            onClick={handleUpload}
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Uploaded Files */}
      <div className="max-w-6xl mx-auto mt-8">
        <h3 className="text-xl font-bold mb-4">Your Uploaded Files</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow flex flex-col"
            >
              <div className="text-sm text-gray-600 mb-2 font-semibold">
                {file.fileName}
              </div>
              <div className="text-xs text-gray-500 mb-2">{file.fileType}</div>
              <div className="flex-1">
                <img
  src={file.fileUrl}
  alt={file.fileName}
  className="w-full h-32 object-contain bg-gray-100 mb-2"
/>

              </div>
              <div className="flex justify-between text-sm">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
}
