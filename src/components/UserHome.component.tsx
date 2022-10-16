// @ts-nocheck
import React, { memo, useState } from 'react';
import { Button, Space, List, Avatar, Skeleton, Input, message, Card, Spin, Modal, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRecoilCallback, useRecoilValue, useRecoilValueLoadable } from 'recoil';
import { accountNameAtom, allUserSelector, contractAddressAtom, ownerAddressAtom } from '../state';
import { useAsyncFn } from 'react-use';
import * as db3 from '../db3';
import _ from 'lodash';

const { Title, Paragraph, Text } = Typography;

const Userhome: React.FC<{}> = memo(props => {
    const ownerAddress = useRecoilValue(ownerAddressAtom);
    const contractAddress = useRecoilValue(contractAddressAtom);
    const accountName = useRecoilValue(accountNameAtom);
    const [userContent, setUserContent] = useState('');

    const [postTwitterState, postTwitter] = useAsyncFn(async () => {
        try {
            const { status, msg } = await db3.runSqlByOwner(
                `insert into tweets values(${(Date.now() / 1000).toFixed()}, '2022-10-11 12:24:00', '${userContent}');`,
            );
            if (status === 0) {
                message.success('The operation succeeded!');
            } else {
                message.error(msg);
            }
        } catch (error) {
            console.error(error);
        }
    }, [userContent]);

    const [followingList, setFollowingList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [followingState, loadFollowing] = useAsyncFn(async () => {
        const { data } = await db3.runSqlByOwner('select * from following;');
        setFollowingList(data);
        console.log(data);
        return data;
    });
    const [followerState, loadFollower] = useAsyncFn(async () => {
        const { data } = await db3.runSqlByOwner('select * from followme;');
        setFollowerList(data);
        return data;
    });
    const [followOneArgs, setFollowOneArgs] = useState<any[]>([]);
    const [followOneState, followOne] = useAsyncFn(async () => {
        try {
            const { status, msg } = await db3.callContract(ownerAddress, contractAddress, {
                method: 'follow_one',
                args: followOneArgs,
            });
            if (status === 0) {
                message.success('The operation succeeded!');
            } else {
                message.error(msg);
            }
        } catch (error) {
            console.error(error);
        }
    }, [followOneArgs]);

    const [twitterListState, loadTwitterList] = useAsyncFn(async () => {
        const { data } = await db3.callContract(ownerAddress, contractAddress, {
            method: 'get_following_tweets_with_addr',
            args: [20, ownerAddress],
        });
        console.log(data);
        return data;
    });

    const [allUserState, loadAllUser] = useAsyncFn(async () => {
        const { data } = await db3.callContract(ownerAddress, contractAddress, {
            method: 'get_public_user',
            args: [],
        });
        console.log(data.data);
        return _.filter(data.data, item => item.user_addr !== ownerAddress);
    });

    const [globalUserVisible, setGlobalUserVisible] = useState(false);
    const [followOneVisible, setFollowOneVisible] = useState(false);
    const [followingVisible, setFollowingVisible] = useState(false);
    const [followerVisible, setFollowerVisible] = useState(false);
    const [userTwittersVisible, setUserTwittersVisible] = useState(false);
    const [publishTwitterVisible, setPublishTwitterVisible] = useState(false);
    return (
        <>
            <div className='user-home'>
                <div className='user-info'>
                    <div style={{ marginBottom: 7 }}>
                        @{accountName} {ownerAddress}
                    </div>
                    <Space align='start'>
                        <Spin spinning={followingState.loading}>
                            <div className='following'>
                                <div className='follow-total'>{`following ${followingList.length}`}</div>
                                <Card
                                    extra={
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => setFollowingVisible(true)}
                                        ></Button>
                                    }
                                    title='Following list'
                                    bordered={false}
                                    style={{ width: 300 }}
                                >
                                    {followingState.value?.map(item => (
                                        <div key={item.addr} style={{ marginBottom: 10 }}>
                                            <Avatar />
                                            {item.name}
                                        </div>
                                    ))}
                                </Card>
                            </div>
                        </Spin>
                        <Spin spinning={followerState.loading}>
                            <div className='follower'>
                                <div className='follow-total'>{`follower ${followerList.length}`}</div>
                                <Card
                                    extra={
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={() => setFollowerVisible(true)}
                                        ></Button>
                                    }
                                    title='follower list'
                                    bordered={false}
                                    style={{ width: 300 }}
                                >
                                    {followerState.value?.map(item => (
                                        <div key={item.addr} style={{ marginBottom: 10 }}>
                                            <Avatar />
                                            {item.name}
                                        </div>
                                    ))}
                                </Card>
                            </div>
                        </Spin>
                    </Space>

                    <Card
                        extra={<Button icon={<ReloadOutlined />} onClick={() => setGlobalUserVisible(true)}></Button>}
                        title='Global User List'
                        style={{ marginTop: 30 }}
                    >
                        <Spin spinning={followOneState.loading}>
                            <div className='global-user'>
                                <List
                                    itemLayout='horizontal'
                                    loading={allUserState.loading}
                                    dataSource={allUserState.value || []}
                                    renderItem={item => (
                                        <List.Item>
                                            <>
                                                <List.Item.Meta title={<a>{item.user_name}</a>} />
                                                <Button
                                                    type='primary'
                                                    onClick={() => {
                                                        setFollowOneVisible(true);
                                                        setFollowOneArgs([
                                                            item.user_name,
                                                            item.user_addr,
                                                            ownerAddress,
                                                            accountName,
                                                        ]);
                                                    }}
                                                >
                                                    follow
                                                </Button>
                                            </>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Spin>
                    </Card>
                </div>
                <div className='user-twitter'>
                    <div className='user-content'>
                        <Input.TextArea
                            value={userContent}
                            onChange={e => setUserContent(e.target.value)}
                        ></Input.TextArea>
                        <Button
                            type='primary'
                            loading={postTwitterState.loading}
                            onClick={() => setPublishTwitterVisible(true)}
                        >
                            Public
                        </Button>
                        <Card
                            style={{ marginTop: 20 }}
                            title='Content List'
                            extra={
                                <Button icon={<ReloadOutlined />} onClick={() => setUserTwittersVisible(true)}></Button>
                            }
                        >
                            <Spin spinning={twitterListState.loading}>
                                {twitterListState.value?.map(item => (
                                    <div key={item.addr}>
                                        <Avatar /> {item.name}
                                        <List
                                            style={{ paddingLeft: 30 }}
                                            itemLayout='horizontal'
                                            dataSource={item.data}
                                            renderItem={item => (
                                                <List.Item>
                                                    <>
                                                        <List.Item.Meta title={<a>{item.tweet}</a>} />
                                                    </>
                                                </List.Item>
                                            )}
                                        />
                                    </div>
                                ))}
                            </Spin>
                        </Card>
                    </div>
                </div>
            </div>
            {/* global user */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={globalUserVisible}
                onCancel={() => setGlobalUserVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going query tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>select `name`, `account` from abcde5.twitter.global_user_list limit 100</Paragraph>
                    <Text strong>Estimate Gas Usage: 1.5 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                loadAllUser();
                                setGlobalUserVisible(false);
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setGlobalUserVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
            {/* follow one */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={followOneVisible}
                onCancel={() => setFollowOneVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going write into tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>contract.abcde5.twitter.follow_one(name:Alice,adr:0x1adgbe)</Paragraph>
                    <Text strong>Estimate Gas Usage: 0.1 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                setFollowOneVisible(false);
                                followOne();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setFollowOneVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
            {/* following */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={followingVisible}
                onCancel={() => setFollowingVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going query tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>select * from asefbs.twitter.table_you_following ;</Paragraph>
                    <Text strong>Estimate Gas Usage: 0.1 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                setFollowingVisible(false);
                                loadFollowing();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setFollowingVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
            {/* follower */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={followerVisible}
                onCancel={() => setFollowerVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going query tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>select * from asefbs.twitter.table_you_follower ;</Paragraph>
                    <Text strong>Estimate Gas Usage: 0.1 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                setFollowerVisible(false);
                                loadFollower();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setFollowerVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
            {/* following twitters */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={userTwittersVisible}
                onCancel={() => setUserTwittersVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are query data from tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>contract.abcde5.twitter. get_content_from_following(page:1,size:10)</Paragraph>
                    <Text strong>Estimate Gas Usage: 0.5 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                setUserTwittersVisible(false);
                                loadTwitterList();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setUserTwittersVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
            {/* publish twitter */}
            <Modal
                style={{ right: 20, margin: 0, float: 'right' }}
                width={350}
                open={publishTwitterVisible}
                onCancel={() => setPublishTwitterVisible(false)}
                title='DB3 network'
                footer={null}
                closable={false}
                maskClosable={false}
            >
                <Typography>
                    <Title>Sign message</Title>
                    <Paragraph>
                        You are going write into tables. The following sql and/or contracts will be executed:
                    </Paragraph>
                    <Paragraph code>contract.abcde5.twitter. publish_twitter({`'${userContent}'`})</Paragraph>
                    <Text strong>Estimate Gas Usage: 0.5 db3</Text>
                </Typography>
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button
                            type='primary'
                            onClick={() => {
                                setPublishTwitterVisible(false);
                                postTwitter();
                            }}
                        >
                            Yes
                        </Button>
                        <Button onClick={() => setPublishTwitterVisible(false)}>No</Button>
                    </Space>
                </div>
            </Modal>
        </>
    );
});
export default Userhome;
