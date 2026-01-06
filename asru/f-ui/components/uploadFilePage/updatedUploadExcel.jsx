import React, { useContext, useEffect, useRef, useState } from 'react';
import { Grid } from '@uhg-abyss/web/ui/Grid';
import { styled } from '@uhg-abyss/web/tools/styled';
import { Text } from '@uhg-abyss/web/ui/Text';
import { Heading } from '@uhg-abyss/web/ui/Heading';
import { Divider } from '@uhg-abyss/web/ui/Divider';
import { StepIndicator } from '@uhg-abyss/web/ui/StepIndicator';
import { useToast } from '@uhg-abyss/web/hooks/useToast';
import { Flex } from '@uhg-abyss/web/ui/Flex';
import StepperSection from '../stepperSection';
import { SelectInput } from '@uhg-abyss/web/ui/SelectInput';
import { FileUpload } from '@uhg-abyss/web/ui/FileUpload';
import { BDA, BUW, CONVERT_STATUS, fileTypesAcceptedBDA, fileTypesAcceptedBDAText, fileTypesAcceptedBUW, fileTypesAcceptedBUWText, getOutputOptions, OUTPUT_OPTIONS, PAGE_NAME, trainingDocumentUrl } from '../const';
import { encryptQueryParams, getMsIdandIsAdmin } from '../../utils/misc';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore';
import { QuestionsModal } from '../questionsModal';
import { RouteContext } from '../../context/RouteContext';
import { buwFlagToParent, sendFileInfoToConsumerApp, tellParentToResetData } from './helper';

const StyledText = styled(Text, {
    fontWeight: '700'
});

const StyledGrid = styled(Grid, {
    padding: '5px'
});

const LinkDiv = styled('div', {
    cursor: 'pointer',
    color: '#196ECF',
    width: '150px',
});

const ContentHeaderDiv = styled('div', {
    justifyContent: 'space-between',
    display: 'flex',
    flexFlow: 'row nowrap',
});

const StyledFileUpload = styled(FileUpload, {
    '&.abyss-file-upload-body-container': {
        height: '40vh',
        backgroundColor: '#E5E5E6 !important'
    }
});

export const UpdatedUploadExcel = () => {
    const { toast } = useToast();
    const { basePath, censusFile, censusAPIData, isLingoChatApiCalling, isDisableBUWSelection, isNewChat, setIsNewChat } = useContext(RouteContext);

    const [uploadData, setUploadData] = useState({
        fileList: [], // Array of uploaded files
        activeStep: -1 // The active step of the timeline
    });
    const [uploadState, setUploadState] = useState(null);
    const [isModal, setIsModal] = useState(false);
    const [isDisabledUpload, setIsDisabledUpload] = useState(false);
    const isManualUpload = useRef(false); // Track manual uploads
    const userInfo = useAuthStore((state) => state.userInfo);
    const setIsBUW = useAuthStore((state) => state.setIsBUW);
    const isBUW = useAuthStore((state) => state.isBUW);

    const navigate = useNavigate();

    useEffect(() => {
    if (censusAPIData && typeof censusAPIData === 'string' && censusAPIData.trim() !== '') {
        navigate(`/${basePath}historyPage`);
    }
}, [censusAPIData]);

     useEffect(() => {
            if (isNewChat) {
                setIsNewChat(false);
                tellParentToResetData();
            }
        }, [isNewChat]);

    useEffect(() => {
        if (isLingoChatApiCalling) {
            setUploadState('inProgress');
        } else {
            setUploadState(null);
        }
    }, [isLingoChatApiCalling]);

    useEffect(() => {
        if (censusFile && !isManualUpload.current) {
            setUploadData({
                fileList: censusFile,
                activeStep: 0
            });
        }
    }, [censusFile]);

    const saveFileinHistory = async (formData) => {
        const { msId } = getMsIdandIsAdmin();
        const encodedParams = encryptQueryParams(`msId=${msId}`);

        return new Promise((resolve, reject) => {
            axios({
                url: `${import.meta.env.VITE_BACKEND_EXPRESS_URL}/save-history?params=${encodedParams}`,
                method: 'POST',
                data: formData
            })
                .then((res) => {
                    console.log('saved to history');
                    resolve(res.data.uniqueId);
                })
                .catch((error) => {
                    console.log(error);
                    console.log('error3');

                    setUploadState(() => 'error');
                    reject('');
                });
        });
    };

    // const convetToXlsx = async (formData) => {
    //     return new Promise((resolve, reject) => {
    //         axios({
    //             url: `${import.meta.env.VITE_BACKEND_EXPRESS_URL}/convert-to-excel`,
    //             method: 'POST',
    //             data: formData,
    //             responseType: 'blob'
    //         })
    //             .then((response) => {
    //                 resolve(response.data);
    //             })
    //             .catch((error) => {
    //                 console.log('error7');
    //                 reject('');
    //             });
    //     });
    // };

    const updateinHistory = async (data) => {
        return new Promise((resolve, reject) => {
            axios({
                url: `${import.meta.env.VITE_BACKEND_EXPRESS_URL}/update-history`,
                method: 'POST',
                data: { remarks: data.remarks, uniqueId: data.uniqueId }
            })
                .then((res) => {
                    console.log('updated in history');
                })
                .catch((error) => {
                    console.log(error);
                    console.log('error2');

                    setUploadState(() => 'error');
                    reject('');
                });
        });
    };

    const removeNaN = (data) => {
        let finalTable = JSON.parse(data.final_table);
        finalTable.forEach((element) => {
            for (const key in element) {
                if (element[key] === 'NaN' || element[key] === 'nan' || element[key] === 'NA' || element[key] === 'na') {
                    element[key] = null;
                }
                if (key === 'Relationship' && !element[key]) {
                    element[key] = 'Data not available';
                }
            }
        });
        data.final_table = finalTable;
        return data;
    };

    const formatInUHC = async () => {
        console.log(basePath,uploadData.fileList)
        if (basePath === 'census-x-formatter/') {
            sendFileInfoToConsumerApp(uploadData.fileList, [], false, true);
        } else {
            console.log('fileList', uploadData.fileList);
            const { msId } = JSON.parse(sessionStorage.getItem('uInfo'));
            let aggregatedFormData = new FormData();

            if (isBUW) {
                aggregatedFormData.append('msid', msId);
            }
            let saveHistoryResUniqueId = '';

            setUploadState('inProgress');

            for (const file of uploadData.fileList) {
                let formData = new FormData();
                formData.append('file', file, file.path);

                if (!isBUW) {
                    saveHistoryResUniqueId = await saveFileinHistory(formData);
                }
                aggregatedFormData.append('file', file, file.path);

            }

            const apiUrl = isBUW ? `${import.meta.env.VITE_BACKEND_PY_URL_BUW}/upload/buw/json` : `${import.meta.env.VITE_BACKEND_PY_URL}/upload/census/json`;

            axios({
                url: apiUrl,
                method: 'POST',
                data: aggregatedFormData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
                }
            })
                .then(async (response) => {
                    if (response.data.errorOccurred || response.data.status === CONVERT_STATUS.ERRORED_OUT) {
                        setUploadState('error');
                        if (!isBUW) {
                            updateinHistory({
                                remarks: response.data.message,
                                uniqueId: saveHistoryResUniqueId
                            })
                                .then(() => {
                                    console.log('History updated successfully');
                                })
                                .catch((error) => {
                                    console.error('Error updating history:', error);
                                });
                        }
                        navigate(`/${basePath}historyPage`);
                        sendFileInfoToConsumerApp(uploadData.fileList, response.data.errorMessage, true);
                        toast.show({
                            title: 'Error Occurred during file processing',
                            message: isBUW ? response.data.errorMessage : response.data.message,
                            variant: 'error',
                            autoClose: 3000
                        });
                        return;
                    }

                    if (!isBUW && response.data.message !== 'Successfully Converted') {
                        updateinHistory({
                            remarks: response.data.message,
                            uniqueId: saveHistoryResUniqueId
                        })
                            .then(() => {
                                console.log('History updated successfully');
                            })
                            .catch((error) => {
                                console.error('Error updating history:', error);
                            });
                    }

                    if (!isBUW && response.data.final_table) {
                        const formattedData = removeNaN(response.data);
                        const newFormattedData = {
                            tier2: JSON.parse(formattedData.tier2),
                            tier3: JSON.parse(formattedData.tier3),
                            tier4: JSON.parse(formattedData.tier4),
                            tier2CR: JSON.parse(formattedData.tier2CR || null),
                            tier3CR: JSON.parse(formattedData.tier3CR || null),
                            tier4CR: JSON.parse(formattedData.tier4CR || null),
                            final_table: formattedData.final_table,
                            message: formattedData.message
                        };

                        await axios({
                            url: `${import.meta.env.VITE_BACKEND_EXPRESS_URL}/json-to-csv`,
                            method: 'POST',
                            data: {
                                data: newFormattedData,
                                uniqueId: saveHistoryResUniqueId,
                                remarks: response.data.message
                            },
                            responseType: 'blob'
                        });
                    }
                    setUploadState(null);
                    const msg = response.data.status === CONVERT_STATUS.COMPLETED_WITH_ERRORS ? response.data.errorMessage : 'Successfully converted the files';
                    sendFileInfoToConsumerApp(uploadData.fileList, msg);
                    toast.show({
                        title: 'Success',
                        message: msg,
                        variant: response.data.status === CONVERT_STATUS.COMPLETED_WITH_ERRORS ? 'warning' : 'success',
                        autoClose: 3000
                    });
                    navigate(`/${basePath}historyPage`);
                })
                .catch(async (error) => {
                    setUploadState('error');
                    const errorMsg = error.message || 'Check remarks column for specific errors';
                    sendFileInfoToConsumerApp(uploadData.fileList, errorMsg, true);
                    toast.show({
                        title: 'Error Occurred during file processing',
                        message: errorMsg,
                        variant: 'error',
                        autoClose: 3000
                    });
                    navigate(`/${basePath}historyPage`);
                    if (!isBUW) {
                        await updateinHistory({
                            remarks: 'Technical Error. Maybe census data not on first tab or some format issues.',
                            uniqueId: saveHistoryResUniqueId
                        });
                    }
                });
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = trainingDocumentUrl;
        link.download = trainingDocumentUrl; // Specify the file name
        link.click();
    };

    const handleOutput = (output) => {
        if (output === '') {
            toast.show({
                title: 'Error',
                message: 'Please select an output to proceed.',
                variant: 'error',
                autoClose: 3000
            });
            setIsDisabledUpload(true);
            setUploadData({fileList:[]})
        } else if (output === 'BUW') {
            setIsBUW(true);
            setIsDisabledUpload(false);
            buwFlagToParent(true);
        } else {
            setIsBUW(false);
            setIsDisabledUpload(false);
            buwFlagToParent(false);
        }
    };

    const outputOptions = getOutputOptions(isDisableBUWSelection);

    return (
        <Flex justify="space-between" direction="column" style={{ padding: '10px', backgroundColor: 'white', overflow: 'hidden', minHeight: '90vh' }}>
            <StyledGrid>
                <Grid.Col span="80%">
                    <StyledText>Welcome {userInfo.preferredName}!</StyledText>
                    <ContentHeaderDiv>
                        <Heading>Census X-Formatter</Heading>
                    </ContentHeaderDiv>
                    <Text>Upload a Document to be formatted into a Census or </Text>
                    <Link to={`/${basePath}historyPage`}>
                        <Text color="#196ECF">access history</Text>
                    </Link>
                    <LinkDiv onClick={() => setIsModal(true)}>Have questions?</LinkDiv>
                </Grid.Col>
                <Grid.Col span="20%">
                    <StepIndicator currentStep={1}>
                        <StepIndicator.Step label="Upload File" />
                        <StepIndicator.Step label="History" />
                    </StepIndicator>
                </Grid.Col>
                <Divider height={1} />
                <Grid.Col span="85%"></Grid.Col>
                <Grid.Col span="15%">
                    <SelectInput label="Select Output" placeholder="" isClearable isSearchable value={isBUW ? BUW : BDA} onChange={handleOutput} options={outputOptions} isRequired={true} />
                </Grid.Col>
                <Grid.Col span="100%" style={{ overflowY: 'auto', height: '50vh', padding: '5px' }}>
                    <StyledFileUpload
                        maxFileSize={2}
                        maxMessage="Max. file size: 2MB"
                        uploadMessage={isBUW ? fileTypesAcceptedBUWText : fileTypesAcceptedBDAText}
                        isUploading={uploadState === 'inProgress'}
                        value={uploadData.fileList}
                        fileTypes={isBUW ? fileTypesAcceptedBUW : fileTypesAcceptedBDA}
                        {...(!isBUW && { maxFiles: 1 })}
                        isDisabled={isDisabledUpload || isLingoChatApiCalling}
                        onChange={(newFileList) => {
                            // Mark this as a manual upload to prevent useEffect from interfering
                            isManualUpload.current = true;

                            // Update local upload data
                            setUploadData({
                                ...uploadData,
                                fileList: newFileList,
                                activeStep: 0
                            });
                            setUploadState(null);
                        }}
                    />
                </Grid.Col>
            </StyledGrid>
            <QuestionsModal isModal={isModal} setIsModal={setIsModal} handleDownload={handleDownload} />
            <StepperSection
                page={PAGE_NAME.UPLOAD_FILE}
                uploadData={uploadData}
                uploadState={uploadState}
                formatInUHC={formatInUHC}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    padding: '15px'
                }}
            />
        </Flex>
    );
};
