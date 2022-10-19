//@ts-nocheck 
import React, { memo, useMemo, useState } from 'react';
import { keyring } from '@polkadot/ui-keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { Button, Form, Input, Space, Typography, Upload } from 'antd';
import { useRecoilState } from 'recoil';
import { accountNameAtom, ownerAddressAtom } from '../state';
import { useNavigate } from 'react-router-dom';
import * as db3 from '../db3';
import { useAsyncFn } from 'react-use';

const { Text } = Typography;

const GeneratorAccount: React.FC<{}> = memo(props => {
    const [accountName, setAccountName] = useRecoilState(accountNameAtom);
    const secret = useMemo(() => mnemonicGenerate(12), []);
    const [ownerAddress, setOwnerAddress] = useRecoilState(ownerAddressAtom);
    const [keyringJSON, setKeyringJSON] = useState({});
    const [visibleAccountInfo, setVisibleAccountInfo] = useState(false);
    const [generatorAccountState, generatorAccount] = useAsyncFn(async () => {
        const { pair, json } = keyring.addUri(secret, `12345678`, { name: accountName });
        db3.setCurrentAccount(pair);
        try {
            await db3.transfer(json.address, 2000);
        } catch (error) {
            console.error(error);
        }
        setKeyringJSON(json);
        setOwnerAddress(json.address);
        setVisibleAccountInfo(true);
    }, [accountName]);
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
                        <Button
                            type='primary'
                            size='large'
                            onClick={() => generatorAccount()}
                            loading={generatorAccountState.loading}
                        >
                            Gennerator DB3 account
                        </Button>
                        <Upload action={uploadUrl} showUploadList={false} onChange={importAccount}>
                            <Button size="large">Choose Account</Button>
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
                            <Button type='primary' onClick={downloadAccount} size='large'>
                                Download Account
                            </Button>
                            <Button type='primary' onClick={() => navigate('/authorization')} size='large'>
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
