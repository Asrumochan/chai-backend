import { Modal } from '@uhg-abyss/web/ui/Modal';
import { Button } from '@uhg-abyss/web/ui/Button';
import { supportEmail } from './const';
import { styled } from '@uhg-abyss/web/tools/styled';
import { Link as EmailLink } from '@uhg-abyss/web/ui/Link';
import { Text } from '@uhg-abyss/web/ui/Text';

const ModalContainer = styled('div', {
    marginTop: '20px',
    marginBottom: '20px'
});

const ButtonDiv = styled('div', {
    display: 'flex',
    justifyContent: 'space-between'
});

export const QuestionsModal = (props) => {
    const { isModal, setIsModal, handleDownload } = props;
    return (
        <Modal title="Have Questions?" isOpen={isModal} onClose={() => setIsModal(false)} size={'lg'}>
            <Modal.Section>
                <Text>For any questions or help, contact:</Text>
                <ModalContainer>
                    <Text>CenXFormatter_Support: </Text>
                    <EmailLink href="mailto:CenXFormatter_Support@ds.uhc.com" isStandardAnchor>
                        {supportEmail}
                    </EmailLink>
                </ModalContainer>
                <ButtonDiv>
                    <Button variant="outline" onClick={() => handleDownload()}>
                        Download Training Document
                    </Button>
                    <Button onClick={() => setIsModal(false)}>Close</Button>
                </ButtonDiv>
            </Modal.Section>
        </Modal>
    );
};
