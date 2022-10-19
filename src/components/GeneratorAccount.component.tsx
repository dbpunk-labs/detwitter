//@ts-nocheck 
import React, { memo, useMemo, useState } from 'react';
import { keyring } from '@polkadot/ui-keyring';
import { createPair } from '@polkadot/keyring/pair';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button, Form, Input, Space, Typography, Upload } from 'antd';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { accountNameAtom, ownerAddressAtom } from '../state';
import { useNavigate } from 'react-router-dom';
import * as db3 from '../db3';
import { isHex, u8aToHex, hexToU8a, stringToU8a, u8aToString } from '@polkadot/util';

const { Text } = Typography;

const GeneratorAccount: React.FC<{}> = memo(props => {
    const [accountName, setAccountName] = useRecoilState(accountNameAtom);
    const secret = useMemo(() => mnemonicGenerate(12), []);
    const [ownerAddress, setOwnerAddress] = useRecoilState(ownerAddressAtom);
    const [keyringJSON, setKeyringJSON] = useState({});
    const [visibleAccountInfo, setVisibleAccountInfo] = useState(false);
    function generatorAccount() {
        const { pair, json } = keyring.addUri(secret, `12345678`, { name: accountName });
        setKeyringJSON(json);
        setOwnerAddress(json.address);
        db3.setCurrentAccount(pair);
        setVisibleAccountInfo(true);
    }
    function downloadAccount() {
        const blob = new Blob([JSON.stringify(keyringJSON)], {
            type: 'application/octet-stream;charset=utf-8',
        });
        const jsonurl = URL.createObjectURL(blob);
        window.open(jsonurl);
    }
    function importAccount({ file }) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const keyringJson = JSON.parse(evt.target.result);
            const restoredPair = keyring.createFromJson(keyringJson);
            keyring.addPair(restoredPair, '12345678');
            db3.setCurrentAccount(keyring.getPair(keyringJson.address));
            setOwnerAddress(keyringJson.address);
            navigate('/authorization');
        };
        reader.readAsText(file.originFileObj);
        return Promise.resolve();
    }
    const navigate = useNavigate();
    const uploadUrl = URL.createObjectURL(new Blob([], { type: 'application/json' }));
    return (
        <div className='generator-account app-container'>
            {!visibleAccountInfo && (
                <>
                    <Space>
                        <Input value={accountName} onChange={e => setAccountName(e.target.value)} />
                        <Button type='primary' onClick={() => generatorAccount()}>
                            Gennerator DB3 account
                        </Button>
                        <Upload action={uploadUrl} showUploadList={false} onChange={importAccount}>
                            <Button>Choose Account</Button>
                        </Upload>
                    </Space>
                </>
            )}
            {visibleAccountInfo && (
                <Form
                    style={{ width: 300 }}
                    name='basic'
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    autoComplete='off'
                >
                    <Form.Item label='Account'>
                        <Text copyable>{ownerAddress}</Text>
                    </Form.Item>
                    <Form.Item label='Secret'>
                        <Text copyable>{secret}</Text>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Space>
                            <Button type='primary' onClick={downloadAccount}>
                                Download Account
                            </Button>
                            <Button type='primary' onClick={() => navigate('/authorization')}>
                                Next
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
});
export default GeneratorAccount;
