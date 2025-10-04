import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import axios from "axios";
import MuiAlert from "@mui/material/Alert";
import * as EmailValidator from "email-validator";
import CahngePassword from "../popup/CahngePassword";
import { LoadingButton } from "@mui/lab";

const bashUrl = process.env.REACT_APP_BASH_URL;
const basImgUrl = process.env.REACT_APP_BASH_IMG_URL;

// Alert notification of MUI
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function Profile({ user }) {
  const navigate = useNavigate();
  const options = {
    Authorization: `Bearer ${localStorage.getItem("shinpay-vendor-token")}`,
    "Content-Type": "multipart/form-data",
  };

  const [loading, setLoading] = useState(true);

  const [circle1, setCircle1] = useState(false);
  const [circle2, setCircle2] = useState(false);
  const [categories, setCategories] = useState([]); // For category options

  const [restaurants, setRestaurants] = useState({
    name: user?.name,
    image: "",
    provins: "",
    address: "",
    pinCode: "",
    restaurantsName: "",
    categoryId: "", // Add categoryId here
    userId: user?._id,
    item: "",
  });

  const [valRestaurants, setValRestaurants] = useState({
    image: "",
    provins: "",
    address: "",
    pinCode: "",
    restaurantsName: "",
    categoryId: "", // Add validation for categoryId
    item: "",
  });

  const [profileImage, setProfileImage] = useState("");
  const [valProfileImage, setValProfileImage] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [valProfile, setValProfile] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [open, setOpen] = useState(false);
  const [customVariant, setCustomVariant] = useState("success");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState();

  const [changePassModale, setChangePassModale] = useState(false);
  // console.log("url: ", basImgUrl);
  const [catalogues, setCatalogues] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [item, setItem] = useState(null); // To hold the item data
  const [subCategory, setSubCategory] = useState(null); // To hold the subcategory data

  const fetchData = async (itemId) => {
    try {
      const response = await axios.get(`${bashUrl}/vendor/items/reverse/${itemId}`, {
        headers: options,
      });
      const { item, subcategory, catalogue } = response.data;
      setSelectedCatalogue(catalogue._id);
      setSelectedSubcategory(subcategory._id);
      setSelectedItem(item._id);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(()=>{
    axios
    .get(`${bashUrl}/vendor/subcategories/${selectedCatalogue}`, {
      headers: options,
    })
    .then((response) => setSubcategories(response.data))
    .catch((error) => console.error(error));
  },[selectedCatalogue]);


  useEffect(()=>{
    axios
    .get(`${bashUrl}/vendor/items/${selectedSubcategory}`, {
      headers: options,
    })
    .then((response) => setItems(response.data))
    .catch((error) => console.error(error));
  },[selectedSubcategory]);




  const handleCatalogueChange = (e) => {
    const catalogueId = e.target.value;
    setSelectedCatalogue(catalogueId);
  };

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategory(subcategoryId);
   
  };

  const handleItemChange = (e) => {
    setSelectedItem(e.target.value);
  };
  const getCategories = async () => {
    try {
      await axios
        .get(`${bashUrl}/vendor/catalogues`, {
          headers: options,
        })
        .then((response) => setCatalogues(response.data))
        .catch((error) => console.error(error));
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const getUserProfileData = async () => {
    return await axios
      .get(`${bashUrl}/vendor/get-by-id/${user?._id}`, { headers: options })
      .then((response) => {
        let result = response.data.result;
        setProfile(result);
        setProfileImage(`${basImgUrl}/profile/${result.image}`);
        setLoading(false);
      })
      .catch((error) => {
        console.log("error on getUserProfileData: ", error);
        setLoading(false);
      });
  };

  const getRestorantData = async () => {
    return await axios
      .get(`${bashUrl}/vendor/get-restoraunt-profile/${user?._id}`, {
        headers: options,
      })
      .then((response) => {
        let result = response.data.result;
        setRestaurants({
          ...restaurants,
          ...restaurants,
          image: `${basImgUrl}/restaurantImage/${result.image}`,
          restaurantsName: result?.restaurantsName,
          address: result?.address,
          provins: result?.provins,
          pinCode: result?.pinCode,
          industry: result?.industry,
          categoryId: result?.categoryId,
          item: result?.itemId,

          year: result?.year,
          location: result?.location,
          empNumber: result?.empNumber,
          mobile: result?.mobile,
          email: result?.email,
          contact: result?.contact,
          webUrl: result?.webUrl,
          timeHours: result?.timeHours,
          description: result?.description,
        });
        setItem(result?.itemId);
        fetchData(result?.itemId)
      })
      .catch((error) => {
        console.log("error on getRestorantData: ", error);
      });
  };

  const handleChange = (evt) => {
    setProfile({ ...profile, [evt.target.name]: evt.target.value });
    setValProfile({
      name: "",
      email: "",
      address: "",
    });
  };

  const handleRestroChange = (evt) => {
    setRestaurants({ ...restaurants, [evt.target.name]: evt.target.value });
    setValRestaurants({
      image: "",
      provins: "",
      address: "",
      pinCode: "",
      industry: "",
      year: "",
      location: "",
      empNumber: "",
      mobile: "",
      email: "",
      contact: "",
      webUrl: "",
      timeHours: "",
      description: "",
      categoryId: "",
      item: "", // Reset validation for categoryId
    });
  };

  const logout = (e) => {
    localStorage.removeItem("shinpay-vendor-token");
    navigate("/signin");
  };

  useEffect(() => {
    getCategories();
    getUserProfileData();
    getRestorantData();
  }, [loading]);

  const handleSubmitProfileImage = async (evt) => {
    setValProfileImage("");
    if (!evt.target.files[0]) {
      setValProfileImage("Please select image");
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", evt.target.files[0]);
      formData.append("id", user?._id);
      return await axios
        .post(`${bashUrl}/vendor/update-profile-image`, formData, {
          headers: options,
        })
        .then((response) => {
          setError("");
          setSuccess(response.data.msg);
          setCustomVariant("success");
          setOpen(true);
          setLoading(false);
        })
        .catch((error) => {
          setSuccess("");
          setError(error.response.data.msg);
          setCustomVariant("error");
          setOpen(true);
          setLoading(false);
        });
    }
  };

  const handleOnChangeImage = (evt) => {
    setImagePreview(URL.createObjectURL(evt.target.files[0]));
    setRestaurants({ ...restaurants, image: evt.target.files[0] });
  };

  const handleSubmitProfile = async (evt) => {
    evt.preventDefault();
    if (!profile.name) {
      setValProfile({ name: "Name can not be empty!" });
    } else if (!profile.email) {
      setValProfile({ email: "Email can not be empty!" });
    } else if (!EmailValidator.validate(profile.email)) {
      setValProfile({ email: "Invalid email!" });
    } else if (!profile.address) {
      setValProfile({ address: "Address can not be empty!" });
    } else if (!restaurants.categoryId) {
      setValRestaurants({ categoryId: "Category ID is required!" });
    } else {
      setLoading(true);
      setCircle2(true);
      return await axios
        .post(`${bashUrl}/vendor/update-profile`, profile, { headers: options })
        .then((response) => {
          setError("");
          setSuccess(response.data.msg);
          setCustomVariant("success");
          setOpen(true);
          setCircle2(false);
          setLoading(false);
        })
        .catch((error) => {
          setSuccess("");
          setError(error.response.data.msg);
          setCustomVariant("error");
          setOpen(true);
          setCircle2(false);
          setLoading(false);
        });
    }
  };

  const handleSubmitRestoranteData = async (evt) => {
    evt.preventDefault();
    if (!restaurants.restaurantsName) {
      setValRestaurants({
        restaurantsName: "Restaurant name can not be empty!",
      });
    } else if (!restaurants.address) {
      setValRestaurants({ address: "Restaurant address can not be empty!" });
    } else if (!restaurants.provins) {
      setValRestaurants({ provins: "Restaurant provins can not be empty!" });
    } else if (!restaurants.pinCode) {
      setValRestaurants({ pinCode: "Restaurant pin code can not be empty!" });
    } else if (!restaurants.industry) {
      setValRestaurants({ industry: "Industry can not be empty!" });
    } else {
      setLoading(true);
      setCircle1(true);
      const formData = new FormData();
      if (restaurants.image) {
        formData.append("image", restaurants.image);
      }
      formData.append("restaurantsName", restaurants.restaurantsName);
      formData.append("address", restaurants.address);
      formData.append("provins", restaurants.provins);
      formData.append("pinCode", restaurants.pinCode);
      formData.append("industry", restaurants.industry);
      formData.append("categoryId", restaurants.categoryId);
      formData.append("year", restaurants.year);
      formData.append("location", restaurants.location);
      formData.append("empNumber", restaurants.empNumber);
      formData.append("mobile", restaurants.mobile);
      formData.append("email", restaurants.email);
      formData.append("contact", restaurants.contact);
      formData.append("webUrl", restaurants.webUrl);
      formData.append("timeHours", restaurants.timeHours);
      formData.append("description", restaurants.description);
      formData.append("item", restaurants.item);

      formData.append("id", user?._id);
      return await axios
        .post(`${bashUrl}/vendor/restoraunt-update`, formData, {
          headers: options,
        })
        .then((response) => {
          setError("");
          setSuccess(response.data.msg);
          setCustomVariant("success");
          setOpen(true);
          setCircle1(false);
          setLoading(false);
        })
        .catch((error) => {
          setSuccess("");
          setError(error.response.data.msg);
          setCustomVariant("error");
          setOpen(true);
          setCircle1(false);
          setLoading(false);
        });
    }
  };

  return (
    <Fragment>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        key={"top" + "right"}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={customVariant}
          sx={{ width: "100%" }}
        >
          {error ? error : success}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <CahngePassword
        openModale={changePassModale}
        setOpenModale={setChangePassModale}
        user={user?._id}
        setLoading={setLoading}
        setSuccess={setSuccess}
        setError={setError}
        setOpen={setOpen}
        setCustomVariant={setCustomVariant}
      />

      <Paper sx={{ width: "100%", borderRadius: 1, mt: 1, p: 2 }}>
        <Box
          component={"form"}
          noValidate
          onSubmit={handleSubmitRestoranteData}
        >
          <Box sx={{ display: "flex" }}>
            <Box>
              <Typography variant="h6" component={"div"}>
                Company Bio Information
              </Typography>
              <Typography variant="body2" sx={{ color: "grey" }}>
                Your restaurant info which will show to user | public.
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="success"
              onClick={logout}
              sx={{ height: 40 }}
            >
              Logout
            </Button>
          </Box>

          <Grid spacing={2} container sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Box
                sx={{
                  width: "100%",
                  height: 100,
                  border: "1px dashed black",
                  borderRadius: 1,
                }}
              >
                <img
                  src={imagePreview ? imagePreview : restaurants?.image}
                  alt=""
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box
                sx={{
                  width: "100%",
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div className="imageDiv">
                  {/* <label htmlFor='prof'><Button  >image</Button></label> */}
                  <label htmlFor="restroImg" className="profileImage">
                    {" "}
                    <p>Upload Image</p>{" "}
                  </label>
                  <input
                    id="restroImg"
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleOnChangeImage}
                  />
                </div>
              </Box>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.restaurantsName}
                type="text"
                id="outlined-basic"
                label="Company Name"
                variant="outlined"
                name="restaurantsName"
                sx={{}}
                placeholder="Enter your full company name."
                onChange={handleRestroChange}
                error={valRestaurants.restaurantsName ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.restaurantsName
                  ? valRestaurants.restaurantsName
                  : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.address}
                type="text"
                id="outlined-basic"
                label="Address"
                variant="outlined"
                name="address"
                sx={{}}
                placeholder="Address"
                onChange={handleRestroChange}
                error={valRestaurants.address ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.address ? valRestaurants.address : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.provins}
                type="text"
                id="outlined-basic"
                label="Provin"
                variant="outlined"
                name="provins"
                sx={{}}
                placeholder="Provin"
                onChange={handleRestroChange}
                error={valRestaurants.provins ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.provins ? valRestaurants.provins : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.pinCode}
                type="number"
                id="outlined-basic"
                label="Pin Code"
                variant="outlined"
                name="pinCode"
                sx={{}}
                placeholder="Pin Code"
                onChange={handleRestroChange}
                error={valRestaurants.pinCode ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.pinCode ? valRestaurants.pinCode : ""}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="select-catalogue-label">
                  Select Catalogue
                </InputLabel>
                <Select
                  labelId="select-catalogue-label"
                  id="select-catalogue"
                  value={selectedCatalogue}
                  onChange={handleCatalogueChange}
                  label="Select Catalogue"
                >
                  <MenuItem value="" disabled>
                    Select a catalogue
                  </MenuItem>
                  {catalogues.map((catalogue) => (
                    <MenuItem key={catalogue._id} value={catalogue._id}>
                      {catalogue.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedCatalogue && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="select-subcategory-label">
                    Select Subcategory
                  </InputLabel>
                  <Select
                    labelId="select-subcategory-label"
                    id="select-subcategory"
                    value={selectedSubcategory ?? subCategory}
                    onChange={handleSubcategoryChange}
                    label="Select Subcategory"
                  >
                    <MenuItem value="" disabled>
                      Select a subcategory
                    </MenuItem>
                    {subcategories.map((subcategory) => (
                      <MenuItem key={subcategory._id} value={subcategory._id}>
                        {subcategory.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selectedSubcategory && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel id="select-item-label">
                    Select SubSubCategory
                  </InputLabel>
                  <Select
                    labelId="select-item-label"
                    id="select-item"
                    value={selectedItem}
                    name="item"
                    onChange={(e) => {
                      handleItemChange(e);
                      handleRestroChange(e);
                    }}
                    label="Select SubSubCategory"
                  >
                    <MenuItem value="" disabled>
                      Select an SubSubCategory
                    </MenuItem>
                    {items.map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        {item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={6}>
              <TextField
                value={restaurants?.industry}
                type="text"
                id="outlined-basic"
                variant="outlined"
                name="industry"
                sx={{}}
                placeholder="Enter the industry your business operates in (e.g., Technology, Healthcare, Retail)."
                onChange={handleRestroChange}
                error={valRestaurants.industry ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.industry ? valRestaurants.industry : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.year}
                type="date"
                id="outlined-basic"
                variant="outlined"
                name="year"
                sx={{}}
                placeholder="Enter the year your business was founded."
                onChange={handleRestroChange}
                error={valRestaurants.year ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.year ? valRestaurants.year : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.location}
                type="text"
                id="outlined-basic"
                variant="outlined"
                name="location"
                sx={{}}
                placeholder={`Enter the address of your company's headquarters.`}
                onChange={handleRestroChange}
                error={valRestaurants.location ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.location ? valRestaurants.location : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.empNumber}
                type="number"
                id="outlined-basic"
                variant="outlined"
                name="empNumber"
                sx={{}}
                placeholder="Enter the total number of employees."
                onChange={handleRestroChange}
                error={valRestaurants.empNumber ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.empNumber ? valRestaurants.empNumber : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.mobile}
                type="number"
                id="outlined-basic"
                variant="outlined"
                name="mobile"
                sx={{}}
                placeholder="Enter the name of the primary contact person for your business."
                onChange={handleRestroChange}
                error={valRestaurants.mobile ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.mobile ? valRestaurants.mobile : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.email}
                type="email"
                id="outlined-basic"
                variant="outlined"
                name="email"
                sx={{}}
                placeholder="Enter the primary email address for business communications."
                onChange={handleRestroChange}
                error={valRestaurants.email ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.email ? valRestaurants.email : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.contact}
                type="number"
                id="outlined-basic"
                variant="outlined"
                name="contact"
                sx={{}}
                placeholder="Enter the primary phone number for business communications."
                onChange={handleRestroChange}
                error={valRestaurants.contact ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.contact ? valRestaurants.mobile : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.webUrl}
                type="url"
                id="outlined-basic"
                variant="outlined"
                name="webUrl"
                sx={{}}
                placeholder={`Enter your company's website URL.`}
                onChange={handleRestroChange}
                error={valRestaurants.webUrl ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.webUrl ? valRestaurants.webUrl : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.timeHours}
                type="time"
                id="outlined-basic"
                variant="outlined"
                name="timeHours"
                sx={{}}
                placeholder={`Enter your standard business hours.`}
                onChange={handleRestroChange}
                error={valRestaurants.timeHours ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.timeHours ? valRestaurants.timeHours : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={restaurants?.description}
                type="text"
                id="outlined-basic"
                variant="outlined"
                name="description"
                sx={{}}
                placeholder="Provide a brief description of your company, including your mission, vision, and core values."
                onChange={handleRestroChange}
                error={valRestaurants.description ? true : false}
                fullWidth
                required
                multiline={5}
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valRestaurants.description ? valRestaurants.description : ""}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              {circle1 ? (
                <LoadingButton loading variant="contained" sx={{}}>
                  Submit
                </LoadingButton>
              ) : (
                <Button variant="contained" color="success" type="submit">
                  Submit
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box
        component={Paper}
        sx={{ borderRadius: 1, p: 2, width: "100%", mt: 2 }}
      >
        <Box>
          <Box sx={{ display: "flex" }}>
            <Typography variant="h5" component={"div"} sx={{ fontWeight: 700 }}>
              Profile Photo
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {/* <Button variant='contained' color='success' onClick={logout}>Logout</Button> */}
          </Box>
          <Typography variant="body2" sx={{ color: "grey" }}>
            Formates: png, jpg, gif, Max Size: 5 MB
          </Typography>
          {/* <Button onClick={logout}>Log out</Button> */}
          <Box sx={{ width: "50%", display: "flex", mt: 1 }}>
            <Avatar src={profileImage} sx={{ width: 80, height: 80 }} />
            <div className="imageDiv">
              {/* <label htmlFor='prof'><Button  >image</Button></label> */}
              <label htmlFor="prof" className="profileImage">
                {" "}
                <p>Upload Image</p>{" "}
              </label>
              <input
                id="prof"
                type="file"
                style={{ display: "none" }}
                onChange={handleSubmitProfileImage}
              />
            </div>
            <Typography
              variant="caption"
              component={"div"}
              color={"error"}
              sx={{}}
            >
              {valProfileImage ? valProfileImage : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ width: "100%", borderRadius: 1, mt: 1, p: 2 }}>
        <Box component={"form"} noValidate onSubmit={handleSubmitProfile}>
          <Typography variant="h6" component={"div"}>
            Personal Info
          </Typography>
          <Typography variant="body2" sx={{ color: "grey" }}>
            Your log-in credentials and the name that is displayed in reports.
          </Typography>

          <Grid spacing={2} container sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <TextField
                value={profile?.name}
                type="text"
                id="outlined-basic"
                label="Name"
                variant="outlined"
                name="name"
                sx={{}}
                placeholder="Name"
                onChange={handleChange}
                error={valProfile.name ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valProfile.name ? valProfile.name : ""}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                value={profile?.email}
                type="email"
                id="outlined-basic"
                label="Email"
                variant="outlined"
                name="email"
                sx={{}}
                placeholder="Email"
                onChange={handleChange}
                error={valProfile.email ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valProfile.email ? valProfile.email : ""}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <TextField
                value={profile?.address}
                type="text"
                id="outlined-basic"
                label="Address"
                variant="outlined"
                name="address"
                sx={{}}
                placeholder="Address"
                onChange={handleChange}
                error={valProfile.address ? true : false}
                fullWidth
                required
              />
              <Typography
                variant="caption"
                component={"div"}
                color={"error"}
                sx={{}}
              >
                {valProfile.address ? valProfile.address : ""}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ height: 55 }}
                color="success"
                onClick={() => setChangePassModale(true)}
              >
                Change Password
              </Button>
            </Grid>
            <Grid item xs={6}>
              {/* <TextField label="Confirm Password" placeholder='Enter confirm password' fullWidth /> */}
              {/* <Button variant='contained' color='success' type='submit'>Submit</Button> */}
              {circle2 ? (
                <LoadingButton loading variant="contained" sx={{}}>
                  Submit
                </LoadingButton>
              ) : (
                <Button variant="contained" color="success" type="submit">
                  Submit
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Fragment>
  );
}

export default Profile;
