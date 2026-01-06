import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidenavbar.scss'; // Ensure this path is correct
import { Modal } from '@uhg-abyss/web/ui/Modal';
import { Button } from '@uhg-abyss/web/ui/Button'; // Adjust the import path as necessary
import SparkleIcon from './contact/SparkleIcon'; // Adjust the import path as necessary
import { RouteContext } from '../context/RouteContext';

export const SideNavBar = ({ activeStep, uploadData }) => {
    const userName = JSON.parse(sessionStorage.getItem('uInfo'))?.userInfo?.preferredName || '';
    const navigate = useNavigate();
    const [modal, setModal] = useState(false);
    const { basePath } = useContext(RouteContext)
    const steps = [
        { label: 'Upload File', route: '' },
        { label: 'History', route: 'historyPage' },
    ];
    const supportEmail = "CenXFormatter_Support@ds.uhc.com";

    useEffect(() => {
        // Reset activeStep when navigating back to the upload page
        if (uploadData?.fileList?.length === 0) {
            activeStep = -1;
        }
    }, [uploadData]);

    const handleStepClick = (route) => {
        navigate(`/${basePath}${route}`);
    };

    return (
        <div className="main-container-header">
            <div className="title-section">
                <div className="header-small bold">Census Formatter</div>
                <div className="header-large bold">Welcome {userName}</div>
                <div className="header-small">Upload a Document to be formatted into a Census</div>
                <div onClick={() => setModal(true)} style={{ color: "rgb(25, 110, 207)", cursor: "pointer" }}>
                    Have Questions?
                </div>
                <Modal
                    title="Have Questions?"
                    isOpen={modal}
                    onClose={() => setModal(false)}
                >
                    <Modal.Section className="help-modal-content">
                        <div className="help-body">
                            <p>For any questions or help, contact:</p>
                            <p className="email-contact">
                                CenXFormatter_Support{' '}
                                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                            </p>
                        </div>
                        <div className="help-actions">
                            <Button variant="outline" className="download-button">
                                Download Training Document
                            </Button>
                            <Button className="close-button" onClick={() => setModal(false)}>
                                Close
                            </Button>
                        </div>
                    </Modal.Section>
                </Modal>
            </div>

            <div className="tracker-section">
                <div className="step-tracker">
                    {steps.map((step, index) => {
                        const isCompleted = uploadData?.fileList?.length > 0 && activeStep > index;
                        const isActive = activeStep === index;
                        const stepClasses = `step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;

                        return (
                            <div key={step.label} className={stepClasses} onClick={() => handleStepClick(step.route)}>
                                <div className="step-circle">
                                    {isCompleted ? '✓' : index + 1}
                                </div>
                                <div className="step-label">{step.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};