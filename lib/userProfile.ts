import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';


// ==========================================
// ADDRESS TYPE
// ==========================================

export type UserAddress = {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
};


// ==========================================
// USER PROFILE TYPE
// ==========================================

export type UserProfile = {
    uid: string;
    name: string;
    email: string;
    phone: string;

    // Old address fields are kept
    // for backward compatibility.
    address: string;
    city: string;
    state: string;
    pinCode: string;

    // New multiple-address system.
    addresses?: UserAddress[];

    createdAt?: unknown;
    updatedAt?: unknown;
};


// ==========================================
// GET USER PROFILE
// ==========================================

export async function getUserProfile(
    uid: string
): Promise<UserProfile | null> {

    const userRef =
        doc(
            db,
            'users',
            uid
        );


    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {
        return null;
    }


    return snapshot.data() as UserProfile;
}


// ==========================================
// SAVE USER PROFILE
// ==========================================

export async function saveUserProfile(
    profile: Omit<
        UserProfile,
        'createdAt' | 'updatedAt'
    >
) {

    const userRef =
        doc(
            db,
            'users',
            profile.uid
        );


    const existing =
        await getDoc(userRef);


    await setDoc(
        userRef,
        {
            ...profile,

            ...(existing.exists()
                ? {}
                : {
                    createdAt:
                        serverTimestamp(),
                }),

            updatedAt:
                serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}


// ==========================================
// GET USER ADDRESSES
// ==========================================

export async function getUserAddresses(
    uid: string
): Promise<UserAddress[]> {

    const profile =
        await getUserProfile(uid);


    if (!profile) {
        return [];
    }


    return profile.addresses || [];
}


// ==========================================
// ADD ADDRESS
// ==========================================

export async function addUserAddress(
    uid: string,
    address: Omit<UserAddress, 'id'>
): Promise<UserAddress> {

    const userRef =
        doc(
            db,
            'users',
            uid
        );


    const existing =
        await getDoc(userRef);


    const existingData =
        existing.exists()
            ? existing.data()
            : {};


    const addresses =
        Array.isArray(
            existingData.addresses
        )
            ? existingData.addresses as UserAddress[]
            : [];


    const newAddress: UserAddress = {

        id: crypto.randomUUID(),

        ...address,

    };


    await setDoc(
        userRef,
        {
            addresses: [
                ...addresses,
                newAddress,
            ],

            updatedAt:
                serverTimestamp(),
        },
        {
            merge: true,
        }
    );


    return newAddress;
}


// ==========================================
// UPDATE ADDRESS
// ==========================================

export async function updateUserAddress(
    uid: string,
    address: UserAddress
): Promise<void> {

    const userRef =
        doc(
            db,
            'users',
            uid
        );


    const existing =
        await getDoc(userRef);


    if (!existing.exists()) {
        throw new Error(
            'User profile not found.'
        );
    }


    const data =
        existing.data();


    const addresses =
        Array.isArray(data.addresses)
            ? data.addresses as UserAddress[]
            : [];


    const updatedAddresses =
        addresses.map(
            (item) =>
                item.id === address.id
                    ? address
                    : item
        );


    await setDoc(
        userRef,
        {
            addresses:
                updatedAddresses,

            updatedAt:
                serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}


// ==========================================
// DELETE ADDRESS
// ==========================================

export async function deleteUserAddress(
    uid: string,
    addressId: string
): Promise<void> {

    const userRef =
        doc(
            db,
            'users',
            uid
        );


    const existing =
        await getDoc(userRef);


    if (!existing.exists()) {
        throw new Error(
            'User profile not found.'
        );
    }


    const data =
        existing.data();


    const addresses =
        Array.isArray(data.addresses)
            ? data.addresses as UserAddress[]
            : [];


    const updatedAddresses =
        addresses.filter(
            (address) =>
                address.id !== addressId
        );


    await setDoc(
        userRef,
        {
            addresses:
                updatedAddresses,

            updatedAt:
                serverTimestamp(),
        },
        {
            merge: true,
        }
    );
}