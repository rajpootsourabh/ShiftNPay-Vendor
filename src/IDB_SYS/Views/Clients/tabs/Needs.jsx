import React, { useState, useEffect, useMemo } from 'react';
import { Form, Row, Col, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSave, faArrowRight, faArrowLeft, faSearch, faUserMd, faUsers } from '@fortawesome/free-solid-svg-icons';
import './Needs.css';

// Master list of all available needs/attributes
const MASTER_NEEDS_LIST = [
  // CNA - PA2 ADL
  { id: 1, name: "CNA - PA2: ADL: Accompany on Outings" },
  { id: 2, name: "CNA - PA2: ADL: Pericare" },
  { id: 3, name: "CNA - PA2: ADL: Shave" },
  { id: 4, name: "CNA - PA2: ADL: Foot and Nail Care" },
  { id: 5, name: "CNA - PA2: ADL: Grocery Shopping" },
  { id: 6, name: "CNA - PA2: ADL: Hygiene" },
  { id: 7, name: "CNA - PA2: ADL: Assistance With Bathing" },
  { id: 8, name: "CNA - PA2: ADL: Assistance With Clothing" },
  { id: 9, name: "CNA - PA2: ADL: Assistance with Eating" },
  { id: 10, name: "CNA - PA2: ADL: Assistance with Wheelchair" },
  { id: 11, name: "CNA - PA2: ADL: Bed Bath or Shower" },
  { id: 12, name: "CNA - PA2: ADL: Diaper Changing" },
  { id: 13, name: "CNA - PA2: ADL: Meal Preparation" },
  { id: 14, name: "CNA - PA2: ADL: Oral Hygiene" },
  { id: 15, name: "CNA - PA2: ADL: Shampoo" },
  { id: 16, name: "CNA - PA2: ADL: Bed Making" },
  { id: 17, name: "CNA - PA2: ADL: Skin Care" },
  // CNA - PA2 Body Mechanics
  { id: 18, name: "CNA - PA2: Body Mechanics, Activities: Able to Lift 50-Plus Pounds" },
  { id: 19, name: "CNA - PA2: Body Mechanics, Activities: Massage" },
  { id: 20, name: "CNA - PA2: Body Mechanics, Activities: Positioning, Repositioning" },
  { id: 21, name: "CNA - PA2: Body Mechanics, Activities: ROM" },
  { id: 22, name: "CNA - PA2: Body Mechanics, Activities: Transfer Techniques" },
  { id: 23, name: "CNA - PA2: Body Mechanics, Activities: Transfering and Turning" },
  { id: 24, name: "CNA - PA2: Body Mechanics, Activities: Transfers, Turning, Positioning" },
  // CNA - PA2 Diabetic Care
  { id: 25, name: "CNA - PA2: Diabetic Care: Diabetes - IDDM, NIDDM" },
  { id: 26, name: "CNA - PA2: Diabetic Care: Performing Fingersticks" },
  { id: 27, name: "CNA - PA2: Diabetic Care: Use of Glucometers" },
  // CNA - PA2 Gastrointestinal
  { id: 28, name: "CNA - PA2: Gastrointestinal: Dehiscene" },
  { id: 29, name: "CNA - PA2: Gastrointestinal: Placement Checks" },
  { id: 30, name: "CNA - PA2: Gastrointestinal: Check for Residuals" },
  { id: 31, name: "CNA - PA2: Gastrointestinal: Colostomy Care" },
  { id: 32, name: "CNA - PA2: Gastrointestinal: Diets: ADA, Renal, Cardiac" },
  { id: 33, name: "CNA - PA2: Gastrointestinal: G-Tubes Feeding and Care" },
  { id: 34, name: "CNA - PA2: Gastrointestinal: Hemovacs - Jackson Pratt" },
  { id: 35, name: "CNA - PA2: Gastrointestinal: Maintains NG Tube" },
  { id: 36, name: "CNA - PA2: Gastrointestinal: Ostomy Care" },
  { id: 37, name: "CNA - PA2: Gastrointestinal: Rectal Tubes, Rectal Bags" },
  { id: 38, name: "CNA - PA2: Gastrointestinal: Tube Feedings" },
  { id: 39, name: "CNA - PA2: Gastrointestinal: GI Surgeries" },
  { id: 40, name: "CNA - PA2: Gastrointestinal: J-Tubes Feeding and Care" },
  { id: 41, name: "CNA - PA2: Gastrointestinal: Nutritional Needs, Turgor" },
  { id: 42, name: "CNA - PA2: Gastrointestinal: T-Tubes" },
  // CNA - PA2 General
  { id: 43, name: "CNA - PA2: General: CPR, First Aid" },
  { id: 44, name: "CNA - PA2: General: Dressing Changes - Sterile" },
  { id: 45, name: "CNA - PA2: General: Wound Irrigation" },
  { id: 46, name: "CNA - PA2: General: Pressure Ulcer Care and Prevention" },
  { id: 47, name: "CNA - PA2: General: Universal Precautions" },
  { id: 48, name: "CNA - PA2: General: Wound Care" },
  { id: 49, name: "CNA - PA2: General: Isolation Techniques" },
  // CNA - PA2 Genitourinary
  { id: 50, name: "CNA - PA2: Genitourinary, Elimination: Bed Pan Assistance" },
  { id: 51, name: "CNA - PA2: Genitourinary, Elimination: Urinal Assistance" },
  { id: 52, name: "CNA - PA2: Genitourinary: Foley Catheter Care" },
  { id: 53, name: "CNA - PA2: Genitourinary: Ins and Outs Data" },
  { id: 54, name: "CNA - PA2: Genitourinary, Elimination: Bowel Movements" },
  { id: 55, name: "CNA - PA2: Genitourinary, Elimination: Fistulas and Shunts Care" },
  { id: 56, name: "CNA - PA2: Genitourinary, Elimination: Foley Catheter Care" },
  { id: 57, name: "CNA - PA2: Genitourinary, Elimination: Ins and Outs Data" },
  // CNA - PA2 Medical Administration
  { id: 58, name: "CNA - PA2: Medical Administration: Duoderm" },
  { id: 59, name: "CNA - PA2: Medical Administration: Ear Drops" },
  { id: 60, name: "CNA - PA2: Medical Administration: Enema Administration" },
  { id: 61, name: "CNA - PA2: Medical Administration: Eye Drops" },
  { id: 62, name: "CNA - PA2: Medical Administration: Solosite Gel" },
  // CNA - PA2 Medical Equipment
  { id: 63, name: "CNA - PA2: Medical Equipment: Abdominal Binders" },
  { id: 64, name: "CNA - PA2: Medical Equipment: Canes, Crutches" },
  { id: 65, name: "CNA - PA2: Medical Equipment: Effica Beds, Clinitron Beds" },
  { id: 66, name: "CNA - PA2: Medical Equipment: Hospital Beds" },
  { id: 67, name: "CNA - PA2: Medical Equipment: Hoyer Lifts" },
  { id: 68, name: "CNA - PA2: Medical Equipment: Montgomery Straps" },
  { id: 69, name: "CNA - PA2: Medical Equipment: Sequential Compression Devices" },
  { id: 70, name: "CNA - PA2: Medical Equipment: Splints" },
  { id: 71, name: "CNA - PA2: Medical Equipment: Gait Belts" },
  { id: 72, name: "CNA - PA2: Medical Equipment: Ted" },
  { id: 73, name: "CNA - PA2: Medical Equipment: Feeding Pumps" },
  // CNA - PA2 Neurological
  { id: 74, name: "CNA - PA2: Neurological: Report Signs and Symptoms of CVA" },
  { id: 75, name: "CNA - PA2: Neurological: Seizure Precautions" },
  { id: 76, name: "CNA - PA2: Neurological: Spinal Cord, Brain Injury" },
  // CNA - PA2 Respiratory
  { id: 77, name: "CNA - PA2: Respiratory: Oxygen Therapy" },
  { id: 78, name: "CNA - PA2: Respiratory: Suctioning" },
  { id: 79, name: "CNA - PA2: Respiratory: Tracheostomy Care" },
  // CNA - PA2 Vascular
  { id: 80, name: "CNA - PA2: Vascular: Fluid Overload" },
  { id: 81, name: "CNA - PA2: Vascular: Infusion Devices - Home, Hospital" },
  { id: 82, name: "CNA - PA2: Vascular: Peripheral Pulses" },
  // CNA - PA2 Vital Signs
  { id: 83, name: "CNA - PA2: Vital Signs: Blood Pressure" },
  { id: 84, name: "CNA - PA2: Vital Signs: Pulse" },
  { id: 85, name: "CNA - PA2: Vital Signs: Respiration" },
  { id: 86, name: "CNA - PA2: Vital Signs: Temperature" },

  // PA1 - Chore ADL
  { id: 100, name: "PA1 - Chore: ADL: Accompany on Outings" },
  { id: 101, name: "PA1 - Chore: ADL: Assistance with Ambulation" },
  { id: 102, name: "PA1 - Chore: ADL: Bed Bath or Shower" },
  { id: 103, name: "PA1 - Chore: ADL: Grocery Shopping" },
  { id: 104, name: "PA1 - Chore: ADL: Assistance With Bathing" },
  { id: 105, name: "PA1 - Chore: ADL: Assistance With Clothing" },
  { id: 106, name: "PA1 - Chore: ADL: Assistance With Eating" },
  { id: 107, name: "PA1 - Chore: ADL: Assistance With Wheelchair" },
  { id: 108, name: "PA1 - Chore: ADL: Diaper Changing" },
  { id: 109, name: "PA1 - Chore: ADL: Foot and Nail Care" },
  { id: 110, name: "PA1 - Chore: ADL: Meal Preparation" },
  { id: 111, name: "PA1 - Chore: ADL: Oral Hygiene" },
  { id: 112, name: "PA1 - Chore: ADL: Pericare" },
  { id: 113, name: "PA1 - Chore: ADL: Shampoo" },
  { id: 114, name: "PA1 - Chore: ADL: Shave" },
  { id: 115, name: "PA1 - Chore: ADL: Skin Care" },
  // PA1 - Chore Body Mechanics
  { id: 116, name: "PA1 - Chore: Body Mechanics, Activity: Able to Lift 50-Plus Pounds" },
  { id: 117, name: "PA1 - Chore: Body Mechanics, Activity: Assistance with Exercises" },
  { id: 118, name: "PA1 - Chore: Body Mechanics, Activity: Positioning, Repositioning" },
  { id: 119, name: "PA1 - Chore: Body Mechanics, Activity: ROM" },
  { id: 120, name: "PA1 - Chore: Body Mechanics, Activity: Transfer Techniques" },
  { id: 121, name: "PA1 - Chore: Body Mechanics, Activity: Transferring and Turning" },
  // PA1 - Chore General
  { id: 122, name: "PA1 - Chore: General: Companionship" },
  { id: 123, name: "PA1 - Chore: General: CPR, First Aid" },
  { id: 124, name: "PA1 - Chore: General: Dressing Changes - Sterile" },
  { id: 125, name: "PA1 - Chore: General: Isolation Techniques" },
  { id: 126, name: "PA1 - Chore: General: Pressure Ulcer Care and Prevention" },
  { id: 127, name: "PA1 - Chore: General: Universal Precautions" },
  { id: 128, name: "PA1 - Chore: General: Wound Care" },
  { id: 129, name: "PA1 - Chore: General: Wound Irrigation" },
  // PA1 - Chore Housekeeping
  { id: 130, name: "PA1 - Chore: Housekeeping: Bathroom Cleanup: Tub, Toilet, Sink" },
  { id: 131, name: "PA1 - Chore: Housekeeping: Bed Making, Linen Change" },
  { id: 132, name: "PA1 - Chore: Housekeeping: Dust and Straighten" },
  { id: 133, name: "PA1 - Chore: Housekeeping: Kitchen Cleanup - Dishes, Wipe Counters" },
  { id: 134, name: "PA1 - Chore: Housekeeping: Laundry - Wash, Dry, Fold" },
  { id: 135, name: "PA1 - Chore: Housekeeping: Vaccum, Sweep, Mop" },

  // RN - LPN Cardiovascular
  { id: 200, name: "RN - LPN: Cardiovascular Problems: 12-Lead EKG" },
  { id: 201, name: "RN - LPN: Cardiovascular Problems: Administration of Post-Op Cardiac Meds" },
  { id: 202, name: "RN - LPN: Cardiovascular Problems: A-Lines" },
  { id: 203, name: "RN - LPN: Cardiovascular Problems: Aneurysm" },
  { id: 204, name: "RN - LPN: Cardiovascular Problems: Angina" },
  { id: 205, name: "RN - LPN: Cardiovascular Problems: Arrhythmia Interpretation" },
  { id: 206, name: "RN - LPN: Cardiovascular Problems: Assessing Lab Values" },
  { id: 207, name: "RN - LPN: Cardiovascular Problems: Atropine" },
  { id: 208, name: "RN - LPN: Cardiovascular Problems: Auscultation of Rate, Rhythm" },
  { id: 209, name: "RN - LPN: Cardiovascular Problems: Blood Drawing From CVC" },
  { id: 210, name: "RN - LPN: Cardiovascular Problems: Blood Pressure" },
  { id: 211, name: "RN - LPN: Cardiovascular Problems: Blood Products" },
  { id: 212, name: "RN - LPN: Cardiovascular Problems: Bypass Surgery Recovery" },
  { id: 213, name: "RN - LPN: Cardiovascular Problems: CABG" },
  { id: 214, name: "RN - LPN: Cardiovascular Problems: Cardiac Catheterization" },
  { id: 215, name: "RN - LPN: Cardiovascular Problems: Central Venous Catheters" },
  { id: 216, name: "RN - LPN: Cardiovascular Problems: CHF" },
  { id: 217, name: "RN - LPN: Cardiovascular Problems: Circulation Checks" },
  { id: 218, name: "RN - LPN: Cardiovascular Problems: Code Blue" },
  { id: 219, name: "RN - LPN: Cardiovascular Problems: Congestive Heart Failure" },
  { id: 220, name: "RN - LPN: Cardiovascular Problems: CPAP, BiPAP Use" },
  { id: 221, name: "RN - LPN: Cardiovascular Problems: CPR" },
  { id: 222, name: "RN - LPN: Cardiovascular Problems: CVP Readings" },
  { id: 223, name: "RN - LPN: Cardiovascular Problems: Defibrillation" },
  { id: 224, name: "RN - LPN: Cardiovascular Problems: Digoxin" },
  { id: 225, name: "RN - LPN: Cardiovascular Problems: Dobutamine Drips" },
  { id: 226, name: "RN - LPN: Cardiovascular Problems: Dopamine Drips, Regitine" },
  { id: 227, name: "RN - LPN: Cardiovascular Problems: Doppler" },
  { id: 228, name: "RN - LPN: Cardiovascular Problems: DVT" },
  { id: 229, name: "RN - LPN: Cardiovascular Problems: Epidural Caths" },
  { id: 230, name: "RN - LPN: Cardiovascular Problems: Epinephrine" },
  { id: 231, name: "RN - LPN: Cardiovascular Problems: Fem-Pop Bypass" },
  { id: 232, name: "RN - LPN: Cardiovascular Problems: Fluid Overload" },
  { id: 233, name: "RN - LPN: Cardiovascular Problems: Heart Transplant Care" },
  { id: 234, name: "RN - LPN: Cardiovascular Problems: Heparin" },
  { id: 235, name: "RN - LPN: Cardiovascular Problems: Infusion Devices--Home, Hospital" },
  { id: 236, name: "RN - LPN: Cardiovascular Problems: IV Fluids" },
  { id: 237, name: "RN - LPN: Cardiovascular Problems: Levophed" },
  { id: 238, name: "RN - LPN: Cardiovascular Problems: Lidocaine--IVP and Drips" },
  { id: 239, name: "RN - LPN: Cardiovascular Problems: Midline Insertion" },
  { id: 240, name: "RN - LPN: Cardiovascular Problems: Nipride" },
  { id: 241, name: "RN - LPN: Cardiovascular Problems: Nitroglycerine" },
  { id: 242, name: "RN - LPN: Cardiovascular Problems: PA Readings" },
  { id: 243, name: "RN - LPN: Cardiovascular Problems: Pacemaker--Permanent" },
  { id: 244, name: "RN - LPN: Cardiovascular Problems: Pacemaker--Temporary" },
  { id: 245, name: "RN - LPN: Cardiovascular Problems: Peripheral Blood Drawing Techniques" },
  { id: 246, name: "RN - LPN: Cardiovascular Problems: Peripheral IV Start" },
  { id: 247, name: "RN - LPN: Cardiovascular Problems: PICC Insertion" },
  { id: 248, name: "RN - LPN: Cardiovascular Problems: Porta Caths" },
  { id: 249, name: "RN - LPN: Cardiovascular Problems: Post Acute M.I." },
  { id: 250, name: "RN - LPN: Cardiovascular Problems: Post Cardiac Surgery" },
  { id: 251, name: "RN - LPN: Cardiovascular Problems: Post Carotid Endarterectomy" },
  { id: 252, name: "RN - LPN: Cardiovascular Problems: Post-Abdominal Aortic Bypass" },
  { id: 253, name: "RN - LPN: Cardiovascular Problems: PT, INR, PTT" },
  { id: 254, name: "RN - LPN: Cardiovascular Problems: Pulses" },
  { id: 255, name: "RN - LPN: Cardiovascular Problems: Sodium Bicarb" },
  { id: 256, name: "RN - LPN: Cardiovascular Problems: Streptokinase" },
  { id: 257, name: "RN - LPN: Cardiovascular Problems: Telemetry" },
  { id: 258, name: "RN - LPN: Cardiovascular Problems: Thrombophlebitis" },
  { id: 259, name: "RN - LPN: Cardiovascular Problems: TPN, Lipids" },
  { id: 260, name: "RN - LPN: Cardiovascular Problems: Tunneled Catheters" },
  { id: 261, name: "RN - LPN: Cardiovascular Problems: Use of Ambu Bag" },
  { id: 262, name: "RN - LPN: Cardiovascular Problems: Valve Replacement Care" },
];

const Needs = ({ formik, clientData, onSaveTab, isSaved, isSaving }) => {
  // State for selected items in each list
  const [selectedMasterItems, setSelectedMasterItems] = useState([]);
  const [selectedClientItems, setSelectedClientItems] = useState([]);
  const [searchMaster, setSearchMaster] = useState('');
  const [searchClient, setSearchClient] = useState('');

  // Initialize client needs from clientData
  useEffect(() => {
    if (clientData && clientData.clientNeeds && Array.isArray(clientData.clientNeeds)) {
      formik.setFieldValue('clientNeeds', clientData.clientNeeds);
    }
  }, [clientData]);

  // Get client needs from formik (array of { needId, required })
  const clientNeeds = formik.values.clientNeeds || [];

  // Get IDs of needs already assigned to client
  const assignedNeedIds = useMemo(() => {
    return new Set(clientNeeds.map(cn => cn.needId));
  }, [clientNeeds]);

  // Filter master list to exclude already assigned needs
  const availableMasterNeeds = useMemo(() => {
    return MASTER_NEEDS_LIST.filter(need => !assignedNeedIds.has(need.id));
  }, [assignedNeedIds]);

  // Filter by search term
  const filteredMasterNeeds = useMemo(() => {
    if (!searchMaster.trim()) return availableMasterNeeds;
    const term = searchMaster.toLowerCase();
    return availableMasterNeeds.filter(need => 
      need.name.toLowerCase().includes(term)
    );
  }, [availableMasterNeeds, searchMaster]);

  // Get full need objects for client needs (with required flag)
  const clientNeedsWithDetails = useMemo(() => {
    return clientNeeds.map(cn => {
      const masterNeed = MASTER_NEEDS_LIST.find(m => m.id === cn.needId);
      return {
        ...cn,
        name: masterNeed ? masterNeed.name : `Unknown Need (ID: ${cn.needId})`
      };
    });
  }, [clientNeeds]);

  // Filter client needs by search
  const filteredClientNeeds = useMemo(() => {
    if (!searchClient.trim()) return clientNeedsWithDetails;
    const term = searchClient.toLowerCase();
    return clientNeedsWithDetails.filter(need => 
      need.name.toLowerCase().includes(term)
    );
  }, [clientNeedsWithDetails, searchClient]);

  // Handle master list item selection (multi-select)
  const handleMasterItemClick = (needId, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      setSelectedMasterItems(prev => 
        prev.includes(needId) 
          ? prev.filter(id => id !== needId)
          : [...prev, needId]
      );
    } else if (event.shiftKey && selectedMasterItems.length > 0) {
      // Range selection
      const lastSelected = selectedMasterItems[selectedMasterItems.length - 1];
      const currentIndex = filteredMasterNeeds.findIndex(n => n.id === needId);
      const lastIndex = filteredMasterNeeds.findIndex(n => n.id === lastSelected);
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeIds = filteredMasterNeeds.slice(start, end + 1).map(n => n.id);
      setSelectedMasterItems(prev => [...new Set([...prev, ...rangeIds])]);
    } else {
      // Single selection
      setSelectedMasterItems([needId]);
    }
  };

  // Handle client list item selection (multi-select)
  const handleClientItemClick = (needId, event) => {
    if (event.ctrlKey || event.metaKey) {
      setSelectedClientItems(prev => 
        prev.includes(needId) 
          ? prev.filter(id => id !== needId)
          : [...prev, needId]
      );
    } else if (event.shiftKey && selectedClientItems.length > 0) {
      const lastSelected = selectedClientItems[selectedClientItems.length - 1];
      const currentIndex = filteredClientNeeds.findIndex(n => n.needId === needId);
      const lastIndex = filteredClientNeeds.findIndex(n => n.needId === lastSelected);
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      const rangeIds = filteredClientNeeds.slice(start, end + 1).map(n => n.needId);
      setSelectedClientItems(prev => [...new Set([...prev, ...rangeIds])]);
    } else {
      setSelectedClientItems([needId]);
    }
  };

  // Move selected items from Master to Client
  const handleMoveToClient = () => {
    if (selectedMasterItems.length === 0) return;

    const newClientNeeds = [
      ...clientNeeds,
      ...selectedMasterItems.map(needId => ({
        needId,
        required: false
      }))
    ];

    formik.setFieldValue('clientNeeds', newClientNeeds);
    setSelectedMasterItems([]);
  };

  // Move selected items from Client back to Master
  const handleMoveToMaster = () => {
    if (selectedClientItems.length === 0) return;

    const newClientNeeds = clientNeeds.filter(
      cn => !selectedClientItems.includes(cn.needId)
    );

    formik.setFieldValue('clientNeeds', newClientNeeds);
    setSelectedClientItems([]);
  };

  // Toggle required checkbox for a client need
  const handleToggleRequired = (needId) => {
    const newClientNeeds = clientNeeds.map(cn => 
      cn.needId === needId 
        ? { ...cn, required: !cn.required }
        : cn
    );
    formik.setFieldValue('clientNeeds', newClientNeeds);
  };

  return (
    <div className="needs-tab">
      <Row className="needs-dual-list">
        {/* Left Panel: Master List */}
        <Col md={5}>
          <div className="needs-panel">
            <div className="needs-panel-header">
              <strong>Needs/Attributes Master List</strong>
            </div>
            <div className="needs-search">
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search master list..."
                  value={searchMaster}
                  onChange={(e) => setSearchMaster(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="needs-list-container">
              <ListGroup className="needs-list">
                {filteredMasterNeeds.map((need) => (
                  <ListGroup.Item
                    key={need.id}
                    active={selectedMasterItems.includes(need.id)}
                    onClick={(e) => handleMasterItemClick(need.id, e)}
                    className="needs-list-item"
                  >
                    {need.name}
                  </ListGroup.Item>
                ))}
                {filteredMasterNeeds.length === 0 && (
                  <div className="text-muted p-3 text-center">
                    {searchMaster ? 'No matching needs found' : 'All needs have been assigned'}
                  </div>
                )}
              </ListGroup>
            </div>
            <div className="needs-panel-footer">
              <small className="text-muted">
                {filteredMasterNeeds.length} items | {selectedMasterItems.length} selected
              </small>
            </div>
          </div>
        </Col>

        {/* Arrow Buttons */}
        <Col md={2} className="d-flex flex-column align-items-center justify-content-center">
          <Button
            variant="success"
            className="needs-arrow-btn mb-3"
            onClick={handleMoveToClient}
            disabled={selectedMasterItems.length === 0}
            title="Move selected to Client Needs"
          >
            <FontAwesomeIcon icon={faArrowRight} size="lg" />
          </Button>
          <Button
            variant="success"
            className="needs-arrow-btn"
            onClick={handleMoveToMaster}
            disabled={selectedClientItems.length === 0}
            title="Remove selected from Client Needs"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="lg" />
          </Button>
        </Col>

        {/* Right Panel: Client Needs */}
        <Col md={5}>
          <div className="needs-panel">
            <div className="needs-panel-header">
              <strong>Client Needs</strong>
            </div>
            <div className="needs-search">
              <InputGroup size="sm">
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search client needs..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="needs-list-container">
              <div className="needs-client-header">
                <span className="needs-col-name">Needs</span>
                <span className="needs-col-required">Required</span>
              </div>
              <ListGroup className="needs-list">
                {filteredClientNeeds.map((need) => (
                  <ListGroup.Item
                    key={need.needId}
                    active={selectedClientItems.includes(need.needId)}
                    onClick={(e) => {
                      // Don't toggle selection if clicking on checkbox
                      if (e.target.type !== 'checkbox') {
                        handleClientItemClick(need.needId, e);
                      }
                    }}
                    className="needs-list-item needs-client-item"
                  >
                    <span className="needs-item-name">{need.name}</span>
                    <Form.Check
                      type="checkbox"
                      checked={need.required}
                      onChange={() => handleToggleRequired(need.needId)}
                      onClick={(e) => e.stopPropagation()}
                      className="needs-required-checkbox"
                    />
                  </ListGroup.Item>
                ))}
                {filteredClientNeeds.length === 0 && (
                  <div className="text-muted p-3 text-center">
                    {searchClient ? 'No matching needs found' : 'No needs assigned to this client'}
                  </div>
                )}
              </ListGroup>
            </div>
            <div className="needs-panel-footer">
              <small className="text-muted">
                {clientNeeds.length} items | {selectedClientItems.length} selected
              </small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mt-4">
        <Col className="d-flex justify-content-center gap-3">
          <Button variant="info" size="sm">
            <FontAwesomeIcon icon={faUserMd} className="me-2" />
            Caregiver Search
          </Button>
          <Button variant="info" size="sm">
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Mass Update - Multiple Clients
          </Button>
        </Col>
      </Row>

      {/* Save Button */}
      <div className="mt-4 pt-3 border-top d-flex justify-content-end">
        <div className="d-flex align-items-center gap-3">
          {isSaved && (
            <span className="text-success d-flex align-items-center">
              <FontAwesomeIcon icon={faCheck} className="me-1" />
              Saved successfully
            </span>
          )}
          <Button
            variant="success"
            onClick={onSaveTab}
            disabled={isSaving || formik.isSubmitting}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Needs;
