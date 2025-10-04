import axios from "axios";


const BaseUrl = process.env.REACT_APP_BASH_URL;
const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "application/json",
};

const API_URL = BaseUrl;

export const uploadDocument = async (formData) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.post(`${API_URL}/vendor/documents/upload`, formData, { headers: options });
};

export const getVendorDocuments = async (vendorId) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.get(`${API_URL}/vendor/documents`, { headers: options });
};

export const deleteDocument = async (documentId) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.delete(`${API_URL}/vendor/documents/${documentId}`, { headers: options });
};

export const assignDocument = async (data) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.post(`${API_URL}/vendor/assigned/documents/assign`, data, { headers: options });
};

export const getSubmittedDocuments = async (vendorId) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.get(`${API_URL}/vendor/documents/assigned`, { headers: options });
};

export const downloadSubmittedDocument = async (docId) => {
    const options = {
        Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
        "Content-Type": "application/json",
    };

    return axios.get(`${API_URL}/vendor/assigned/documents/download/${docId}`, { headers: options }, {
        responseType: "blob",
    });
};
