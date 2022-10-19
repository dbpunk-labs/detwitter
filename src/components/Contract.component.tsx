import React, { memo } from 'react';
import { Modal, Typography, Avatar } from 'antd';
import { useRecoilValue } from 'recoil';
import { appAddressAtom } from '../state';

const { Text } = Typography;

const EllipsisMiddle: React.FC<{ suffixCount: number; children: string }> = ({ suffixCount, children }) => {
    const start = children.slice(0, children.length - suffixCount).trim();
    const suffix = children.slice(-suffixCount).trim();
    return (
        <Text style={{ maxWidth: 70 }} ellipsis={{ suffix }}>
            {start}
        </Text>
    );
};

interface Props {
    visible: boolean;
    onCancel: (visible: boolean) => void;
    children: React.ReactNode;
}

const Contract: React.FC<Props> = memo(props => {
    const { visible, onCancel } = props;
    const appContract = useRecoilValue(appAddressAtom);
    return (
        <div>
            <Modal
                className='contract-modal'
                style={{ top: 70, right: 20, margin: 0, float: 'right', transformOrigin: 0 }}
                width={350}
                open={visible}
                onCancel={() => onCancel(false)}
                getContainer={false}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        DB3 network
                        <div>
                            <Avatar style={{ marginRight: 7 }} />
                            <EllipsisMiddle suffixCount={4}>{appContract}</EllipsisMiddle>
                        </div>
                    </div>
                }
                footer={null}
                closable={false}
                maskClosable={false}
            >
                {props.children}
            </Modal>
        </div>
    );
});
export default Contract;
