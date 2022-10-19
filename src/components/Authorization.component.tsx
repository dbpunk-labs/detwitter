// @ts-nocheck
import React, { memo, useState } from 'react';
import { Button, Modal, Typography, Space, message } from 'antd';
import { useAsyncFn, useStateWithHistory } from 'react-use';
import { keyring } from '@polkadot/ui-keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import * as db3 from '../db3';
import { useRecoilValue } from 'recoil';
import { delegateAddressAtom, ownerAddressAtom, appEllipsisAddressAtom, contractEllipsisAddressAtom } from '../state';
import { useNavigate } from 'react-router-dom';
import { sqlCode } from './createSql';
import Contract from './Contract.component';

const { Title, Paragraph, Text } = Typography;

const Authorization: React.FC<{}> = memo(props => {
    const [visible, setVisible] = useState(false);
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    const delegateAddress = useRecoilValue(delegateAddressAtom);
    const appEllipsisAddress = useRecoilValue(appEllipsisAddressAtom);
    const contractEllipsisAddress = useRecoilValue(contractEllipsisAddressAtom);
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
            <div className='register app-container'>
                <Button type='primary' onClick={() => setVisible(true)}>
                    Register as DT user
                </Button>
                {/* <Button type='primary' onClick={() => generatorAccount()}>
                    Gennerator DB3 account
                </Button> */}
            </div>
            <Contract visible={visible} onCancel={setVisible}>
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You’ll grand Twitter to create tables under your account. Twitter will have full access of these
                        tables after created, you can revoke anytime. Tables includ the following:
                    </Paragraph>
                    <Paragraph code>
                        {appEllipsisAddress}.twitter.table_you_following {appEllipsisAddress}.twitter.table_follow_you
                        {appEllipsisAddress}.twitter.table_your_content
                    </Paragraph>
                    <Paragraph>
                        In addition, Twitter will write some basic info of your account to Twitter’s official public
                        tables which include the following tables:
                    </Paragraph>
                    <Paragraph code>
                        {appEllipsisAddress}.twitter.global_user_list {appEllipsisAddress}.twitter.global_user_content
                    </Paragraph>
                    <Paragraph>
                        You will also be agreed to authorilize the following contracts to read and write your tables
                        that relarent
                    </Paragraph>
                    <Paragraph code>
                        contract.{contractEllipsisAddress}.twitter.registe_user contract.{contractEllipsisAddress}
                        .twitter.follow_one ...
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
            </Contract>
        </>
    );
});
export default Authorization;
