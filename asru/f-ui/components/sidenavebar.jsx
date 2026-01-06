import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sidenavbar.scss'; // Ensure this path is correct
import HelpContentModal from './contact/HelpContentModal'; // Adjust the import path as necessary
import { Modal } from '@uhg-abyss/web/ui/Modal';
import SparkleIcon from './contact/SparkleIcon';
import { Button } from '@uhg-abyss/web/ui/Button'; // Adjust the import path as necessary
import { RouteContext } from '../context/RouteContext';

export const SideNavBar = ({ activeStep }) => {
    const userName = JSON.parse(sessionStorage.getItem('uInfo'))?.userInfo?.preferredName || '';
    const navigate = useNavigate();
    const { basePath } = useContext(RouteContext)
    const [modal, setModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const steps = [
        { label: 'Upload File', route: '' },
        { label: 'History', route: 'historyPage' },
    ];
    // const trainingDocumentUrl = "https://renewal-xml-dev.s3api-core.uhc.com/Census-X-Formatter%20Tool_v1.0.docx"; // Replace with the actual path to your Word document
    const trainingDocumentUrl = "https://s3api-core.uhc.com/renewal-xml-dev/Internal%20Sales_Census%20X-Formatter.docx"; // Replace with the actual path to your Word document

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = trainingDocumentUrl;
    console.log("Downloading training document from:", trainingDocumentUrl);
    link.download = trainingDocumentUrl; // Specify the file name
    link.click();
  };
    const supportEmail = "<CenXFormatter_Support@ds.uhc.com>";
    const handleStepClick = (route) => {
        navigate(`/${basePath}${route}`);
    };

    return (
        <div className="main-container-header">
            <div className="title-section">
                <div className="header-small bold">Census Formatter</div>
                <div className="header-large bold">Welcome {userName}</div>
                <div className="header-small">Upload a Document to be formatted into a Census</div>
                <div onClick={() => setModal(true)} style={{color:"rgb(25, 110, 207)"}}>Have Questions?</div>
                <Modal
        title="Have Questions?"
        isOpen={modal}
        onClose={() => setModal(false)}
      >
        <Modal.Section className="help-modal-content">
        {/* <div className="help-header">
          <SparkleIcon className="help-icon" />
          <span>Help Content</span>
        </div> */}
        <div className="help-body">
          <p>For any questions or help, contact:</p>
          <p className="email-contact">
            CenXFormatter_Support{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
        </div>
        <div className="help-actions">
        <Button className="download-button" variant="outline" onClick={handleDownload}>

            Download Training Document
          </Button>
          <Button className="close-button" onClick={false}>
            Close
          </Button>
        </div>
        </Modal.Section>
      </Modal>
            </div>

            <div className="tracker-section">
                <div className="step-tracker">
                    {steps.map((step, index) => {
                        const isCompleted = activeStep > index;
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