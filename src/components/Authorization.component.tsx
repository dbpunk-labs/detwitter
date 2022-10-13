import React, { memo, useState } from 'react';
import { Button, Modal, Typography, Space, message } from 'antd';
import { useAsyncFn, useStateWithHistory } from 'react-use';
import { keyring } from '@polkadot/ui-keyring';
import rpc from '../api/rpc.api';
import * as db3 from '../db3';
import { useRecoilValue } from 'recoil';
import { delegateAddressAtom, ownerAddressAtom } from '../state';
import { useNavigate } from 'react-router-dom';
import { sqlCode } from './createSql';

const { Title, Paragraph, Text, Link } = Typography;

const Register: React.FC<{}> = memo(props => {
    const [visible, setVisible] = useState(false);
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    const delegateAddress = useRecoilValue(delegateAddressAtom);
    const navigate = useNavigate();

    const [authorizationState, authorization] = useAsyncFn(async () => {
        try {
            const { status, msg } = await db3.createNsAndAddDelegate(delegateAddress!, keyring.getPair(ownerAddress!));
            if (status !== 0) {
                message.error(msg);
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
        try {
            const { status, msg } = await db3.runSqlByOwner(sqlCode);
            if (status !== 0) {
                message.error(msg);
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
        localStorage.setItem('dtwitter_isAuthorization', '1');
        message.success('Authorization succeeded!');
        navigate('/register');
    }, [ownerAddress, delegateAddress]);
    return (
        <>
            <div className='register'>
                <Button type='primary' onClick={() => setVisible(true)}>
                    Register as DT user
                </Button>
            </div>
            <Modal open={visible} onCancel={() => setVisible(false)} title='DB3 network' footer={null} closable={false}>
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You’ll grand Twitter to create tables under your account. Twitter will have full access of these
                        tables after created, you can revoke anytime. Tables includ the following:
                    </Paragraph>
                    <Paragraph code>
                        asefbs.twitter.table_you_following asefbs.twitter.table_follow_you
                        asefbs.twitter.table_your_content
                    </Paragraph>
                    <Paragraph>
                        In addition, Twitter will write some basic info of your account to Twitter’s official public
                        tables which include the following tables:
                    </Paragraph>
                    <Paragraph code>abcde5.twitter.global_user_list abcde5.twitter.global_user_content</Paragraph>
                    <Paragraph>
                        You will also be agreed to authorilize the following contracts to read and write your tables
                        that relarent
                    </Paragraph>
                    <Paragraph code>
                        contract.abcde5.twitter.registe_user contract.abcde5.twitter.follow_one ...
                    </Paragraph>
                    <Text strong>Estimate Gas Usage: 1.5 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button type='primary' loading={authorizationState.loading} onClick={authorization}>
                            Yes
                        </Button>
                        <Button onClick={() => setVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
        </>
    );
});
export default Register;
