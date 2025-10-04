import React, { useEffect, useState } from "react";
import { getSubmittedDocuments, downloadSubmittedDocument } from "../api/documentApi";

const SubmittedDocuments = ({ vendorId }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchSubmittedDocuments();
  }, []);

  const fetchSubmittedDocuments = async () => {
    const res = await getSubmittedDocuments(vendorId);
    setDocuments(res.data);
  };

  const handleDownload = async (docId, fileName) => {
    const response = await downloadSubmittedDocument(docId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2>Submitted Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            {doc.documentId.name} - {doc.assignedTo.name}
            <button onClick={() => handleDownload(doc._id, doc.documentId.name)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubmittedDocuments;
