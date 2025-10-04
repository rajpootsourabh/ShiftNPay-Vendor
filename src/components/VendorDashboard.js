import "bootstrap/dist/css/bootstrap.min.css";
import "./../css/custom.css";
import React, { useEffect, useState } from "react";
import {
    Button,
    FormGroup,
    Label,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Table,
    Container,
    Row,
    Col,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
} from "reactstrap";
import { toast } from "react-toastify";
import classnames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import {
    addChecklist,
    getAssignedChecklists,
    fetchChecklists,

} from "../store/CheckList/checklistSlice";

import { fetchEmployeesByVendor } from "../store/Tracker/trackerSlice";
import { useDropzone } from "react-dropzone";
import DocumentList from "./DocumentList";
import AssignedDocument from "./AssignDocument";
import { fetchAssignedDocuments } from "../store/AssignedDocument/assignedDocumentSlice";

const ChecklistApp = ({user}) => {
    const [activeTab, setActiveTab] = useState("1");
    const dispatch = useDispatch();
    const toggleTab = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    useEffect(()=>{
        dispatch(fetchAssignedDocuments())
    },[activeTab])
    return (
        <Container className="mt-5 mx-2">
            <Row className="row bg-white border rounded">
                <Col md="12" className="px-0">
                    <Nav tabs className="mb-0 checkListMenu">
                        <div>
                            <p
                                className={classnames({ active: activeTab === "1" })}
                                onClick={() => toggleTab("1")}
                                style={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#000",
                                    padding: "1rem 2rem",
                                    fontSize: "17px",
                                    marginBottom: "0px",
                                }}
                            >
                                Documents
                            </p>
                        </div>
                        <div>
                            <p
                                className={classnames({ active: activeTab === "3" })}
                                onClick={() => toggleTab("3")}
                                style={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#000",
                                    padding: "1rem 2rem",
                                    fontSize: "17px",
                                    marginBottom: "0px",
                                }}
                            >
                                Assinged Documents
                            </p>
                        </div>
                    </Nav>

                    <TabContent activeTab={activeTab} className="my-3">
                        <TabPane tabId="1">
                                <DocumentList />
                        </TabPane>
                        <TabPane tabId="3">
                        <AssignedDocument user={user}/>
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
           
        </Container>

    );
};

export default ChecklistApp;
