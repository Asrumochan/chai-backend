import { DropdownMenu } from '@uhg-abyss/web/ui/DropdownMenu';
import { IconSymbol } from '@uhg-abyss/web/ui/IconSymbol';
import { CONVERT_STATUS, FILE_TYPE } from '../components/const';

export const DownloadAction = ({ props }) => {
    const menuItems = [
        {
            title: FILE_TYPE.ORIGINAL_FILE,
            onClick: () => {
                window.location.href = props.originalFileUrl;
            }
        },
        {
            title: FILE_TYPE.CONVERTED_FILE,
            onClick: () => {
                window.location.href = props.formattedFileUrl;
            }
        }
    ];
    const handleMenuItems = () => {
        if(props.status === CONVERT_STATUS.ERRORED_OUT){
            return menuItems.filter((item)=> item.title !== FILE_TYPE.CONVERTED_FILE)
        }
        else{
            return menuItems
        }
    };
    return (
        <>
            <DropdownMenu label="Download" before={<IconSymbol icon="download" />} after={<IconSymbol icon="keyboard_arrow_down" />} menuItems={handleMenuItems()} />
        </>
    );
};
