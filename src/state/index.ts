// @ts-nocheck
import { atom, selector } from 'recoil';
import _ from 'lodash';
import * as db3 from '../db3';
import { message } from 'antd';
import rpc from '../api/rpc.api';

export const contractAddressAtom = atom<string>({
    key: 'contractAddressAtom',
    default: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
});

export const contractEllipsisAddressAtom = atom<string>({
    key: 'contractEllipsisAddressAtom',
    default: '5D...TXFy',
});

export const delegateAddressAtom = atom({
    key: 'delegateAddressAtom',
    default: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
});

export const appAddressAtom = atom({
    key: 'appAddressAtom',
    default: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
});

export const appEllipsisAddressAtom = atom({
    key: 'appEllipsAddressAtom',
    default: '5C...2DjL',
});

export const ownerAddressAtom = atom<string>({
    key: 'ownerAddressAtom',
    default: selector({
        key: 'ownerAddressAtom/default',
        get: () => {
            return localStorage.getItem('dtwitter_owner_address');
        },
    }),
    effects: [
        ({ onSet }) => {
            onSet(value => {
                localStorage.setItem('dtwitter_owner_address', value);
            });
        },
    ],
});

export const accountNameAtom = atom<string>({
    key: 'accountNameAtom',
    default: null,
});

export const twitterNameAtom = atom<string>({
    key: 'twitterNameAtom',
    default: selector({
        key: 'twitterNameAtom/default',
        get: () => {
            return localStorage.getItem('dtwitter_account_name');
        },
    }),
    effects: [
        ({ onSet }) => {
            onSet(value => {
                localStorage.setItem('dtwitter_account_name', value);
                localStorage.setItem('dtwitter_isRegister', '1');
            });
        },
    ],
});

export const allAccountAtom = atom({
    key: 'allAccountAtom',
    default: [],
});

export const allUserSelector = selector({
    key: 'allUserSelector',
    get: async ({ get }) => {
        const ownerAddress = get(ownerAddressAtom);
        const contractAddr = get(contractAddressAtom);
        const { data } = await db3.callContract(ownerAddress, contractAddr, {
            method: 'get_public_user',
            args: [],
        });
        return _.filter(data.data, item => item.user_addr !== ownerAddress);
    },
});
export const followingTwitterSelector = selector({
    key: 'followingTwitterSelector',
    get: async ({ get }) => {
        const ownerAddress = get(ownerAddressAtom);
        const contractAddr = get(contractAddressAtom);
        const { data } = await db3.callContract(ownerAddress, contractAddr, {
            method: 'get_following_tweets',
            args: [3],
        });
        return data.data;
    },
});
