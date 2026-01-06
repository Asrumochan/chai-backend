import { CONVERT_STATUS } from "../const";

const dispatchCustomEvent = (eventName, detail) => {
    try {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true }));
        }
    } catch (error) {
        console.error(`Error in ${eventName}:`, error);
    }
};

export const sendFileInfoToConsumerApp = (files, resp_msg = [], is_error = false, isBDA = false) => {
    if (isBDA && files.length > 0) {
        dispatchCustomEvent('fileUploaded', { fileName: files, isCensusBDAFile: true });
    }
};

export const tellParentToResetData = () => {
    dispatchCustomEvent('resetCensusData', { tellParentToResetCensusData: true });
};

export const buwFlagToParent = (flag = false) => {
    dispatchCustomEvent('buwFlagChanged', { buwFlag: flag });
};


export const getToastConfig = (status) => {
    if (status === CONVERT_STATUS.COMPLETED) {
        return { title: 'Success', variant: 'success' };
    }
    if (status === CONVERT_STATUS.COMPLETED_WITH_ERRORS) {
        return { title: 'Warning', variant: 'warning' };
    }
    return { title: 'Error', variant: 'error' };
};