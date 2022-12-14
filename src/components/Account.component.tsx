import React, { useState, useEffect } from 'react';
import { Select, Modal } from 'antd';
import * as db3 from '../db3';
import { keyring } from '@polkadot/ui-keyring';
import { useRecoilValue, useRecoilState } from 'recoil';
import { accountNameAtom, allAccountAtom, ownerAddressAtom } from '../state';
import _ from 'lodash';

const { Option } = Select;

function Main() {
    const [ownerAddress, setOwerAddress] = useRecoilState(ownerAddressAtom);
    const [visible, setVisible] = useState(!ownerAddress);
    const allAccount = useRecoilValue(allAccountAtom);
    const [accountName, setAccountName] = useRecoilState(accountNameAtom);

    useEffect(() => {
        setVisible(!ownerAddress);
    }, [ownerAddress]);

    useEffect(() => {
        if (ownerAddress && allAccount.length) {
            const accountName = _.find(allAccount, (item: any) => item.value === ownerAddress).label;
            setAccountName(accountName);
        }
    }, [ownerAddress, allAccount]);

    function onChange(value: string) {
        setOwerAddress(value);
        db3.setCurrentAccount(keyring.getPair(value));
    }
    return (
        <>
            {/* <div style={{ color: '#fff' }}>
                <Space>
                    {accountName}
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                </Space>
            </div> */}
            <Modal
                open={visible}
                footer={null}
                title='Select account'
                maskClosable={false}
                onCancel={() => setVisible(false)}
            >
                <Select onChange={onChange} style={{ width: '100%' }}>
                    {allAccount.map((item: any) => (
                        <Option key={item.value} value={item.value}>
                            {item.label}
                        </Option>
                    ))}
                </Select>
            </Modal>
        </>
    );
}

export default function AccountSelector() {
    return <Main />;
}
