'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    MapPin,
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    Home,
    Briefcase,
    MapPinned,
} from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { useAuth } from '@/context/AuthContext';

import {
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    type UserAddress,
} from '@/lib/userProfile';


type AddressForm = {
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
};


const emptyForm: AddressForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
};


export default function AddressPage() {

    const router = useRouter();

    const {
        user,
        loading,
    } = useAuth();


    // ==========================================
    // ADDRESSES
    // ==========================================

    const [addresses, setAddresses] =
        useState<UserAddress[]>([]);


    // ==========================================
    // FORM
    // ==========================================

    const [form, setForm] =
        useState<AddressForm>(emptyForm);

    const [showForm, setShowForm] =
        useState(false);

    const [editingId, setEditingId] =
        useState<string | null>(null);


    // ==========================================
    // PAGE STATE
    // ==========================================

    const [pageLoading, setPageLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState('');

    const [saved, setSaved] =
        useState(false);


    // ==========================================
    // AUTH CHECK
    // ==========================================

    useEffect(() => {

        if (
            !loading &&
            !user
        ) {

            router.replace('/login');

        }

    }, [
        user,
        loading,
        router,
    ]);


    // ==========================================
    // LOAD ADDRESSES
    // ==========================================

    useEffect(() => {

        async function loadAddresses() {

            if (!user) {
                return;
            }

            setPageLoading(true);
            setError('');

            try {

                const savedAddresses =
                    await getUserAddresses(
                        user.uid
                    );

                setAddresses(
                    savedAddresses
                );

            } catch (error) {

                console.error(
                    'Failed to load addresses:',
                    error
                );

                setError(
                    'Unable to load your saved addresses.'
                );

            } finally {

                setPageLoading(false);

            }

        }


        if (user) {
            loadAddresses();
        }

    }, [user]);


    // ==========================================
    // UPDATE FIELD
    // ==========================================

    function updateField(
        field: keyof AddressForm,
        value: string
    ) {

        setForm(
            (current) => ({
                ...current,
                [field]: value,
            })
        );

    }


    // ==========================================
    // OPEN ADD FORM
    // ==========================================

    function openAddForm() {

        setEditingId(null);

        setForm({
            ...emptyForm,
            fullName:
                user?.displayName || '',
        });

        setError('');
        setSaved(false);

        setShowForm(true);

        setTimeout(() => {

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
            });

        }, 100);

    }


    // ==========================================
    // OPEN EDIT FORM
    // ==========================================

    function openEditForm(
        address: UserAddress
    ) {

        setEditingId(address.id);

        setForm({

            label:
                address.label || 'Home',

            fullName:
                address.fullName || '',

            phone:
                address.phone || '',

            street:
                address.street || '',

            city:
                address.city || '',

            state:
                address.state || '',

            pinCode:
                address.pinCode || '',

        });

        setError('');
        setSaved(false);

        setShowForm(true);

        setTimeout(() => {

            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
            });

        }, 100);

    }


    // ==========================================
    // CLOSE FORM
    // ==========================================

    function closeForm() {

        setShowForm(false);

        setEditingId(null);

        setForm({
            ...emptyForm,
            fullName:
                user?.displayName || '',
        });

        setError('');
        setSaved(false);

    }


    // ==========================================
    // SAVE ADDRESS
    // ==========================================

    async function handleSave(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();


        if (!user) {
            return;
        }


        // ======================================
        // VALIDATION
        // ======================================

        if (!form.fullName.trim()) {

            setError(
                'Please enter the full name.'
            );

            return;

        }


        if (!form.phone.trim()) {

            setError(
                'Please enter your phone number.'
            );

            return;

        }


        if (!form.street.trim()) {

            setError(
                'Please enter your street address.'
            );

            return;

        }


        if (!form.city.trim()) {

            setError(
                'Please enter your city.'
            );

            return;

        }


        if (!form.state.trim()) {

            setError(
                'Please enter your state.'
            );

            return;

        }


        if (
            form.pinCode.length !== 6
        ) {

            setError(
                'Please enter a valid 6-digit PIN code.'
            );

            return;

        }


        setError('');
        setSaved(false);
        setSaving(true);


        try {

            // ==================================
            // EDIT EXISTING
            // ==================================

            if (editingId) {

                const updatedAddress:
                    UserAddress = {

                    id: editingId,

                    label:
                        form.label.trim(),

                    fullName:
                        form.fullName.trim(),

                    phone:
                        form.phone.trim(),

                    street:
                        form.street.trim(),

                    city:
                        form.city.trim(),

                    state:
                        form.state.trim(),

                    pinCode:
                        form.pinCode.trim(),

                };


                await updateUserAddress(
                    user.uid,
                    updatedAddress
                );


                setAddresses(
                    current =>
                        current.map(
                            address =>
                                address.id ===
                                    editingId
                                    ? updatedAddress
                                    : address
                        )
                );

            }


            // ==================================
            // ADD NEW
            // ==================================

            else {

                const newAddress =
                    await addUserAddress(
                        user.uid,
                        {

                            label:
                                form.label.trim(),

                            fullName:
                                form.fullName.trim(),

                            phone:
                                form.phone.trim(),

                            street:
                                form.street.trim(),

                            city:
                                form.city.trim(),

                            state:
                                form.state.trim(),

                            pinCode:
                                form.pinCode.trim(),

                        }
                    );


                setAddresses(
                    current => [
                        ...current,
                        newAddress,
                    ]
                );

            }


            setSaved(true);

            setShowForm(false);

            setEditingId(null);

            setForm({
                ...emptyForm,
                fullName:
                    user.displayName || '',
            });


            setTimeout(() => {

                setSaved(false);

            }, 2500);


        } catch (error) {

            console.error(
                'Failed to save address:',
                error
            );

            setError(
                'Unable to save the address. Please try again.'
            );

        } finally {

            setSaving(false);

        }

    }


    // ==========================================
    // DELETE
    // ==========================================

    async function handleDelete(
        addressId: string
    ) {

        if (!user) {
            return;
        }


        const confirmed =
            window.confirm(
                'Are you sure you want to delete this address?'
            );


        if (!confirmed) {
            return;
        }


        setDeletingId(addressId);
        setError('');


        try {

            await deleteUserAddress(
                user.uid,
                addressId
            );


            setAddresses(
                current =>
                    current.filter(
                        address =>
                            address.id !== addressId
                    )
            );


        } catch (error) {

            console.error(
                'Failed to delete address:',
                error
            );

            setError(
                'Unable to delete the address.'
            );

        } finally {

            setDeletingId(null);

        }

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (
        loading ||
        pageLoading ||
        !user
    ) {

        return (

            <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">

                <div className="text-center">

                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />

                    <p className="mt-4 text-sm text-stone-600">
                        Loading your addresses...
                    </p>

                </div>

            </div>

        );

    }


    return (

        <>
            <Navbar />


            <main className="min-h-screen bg-[#FAF8F5]">


                {/* ==================================
                    HEADER
                ================================== */}

                <section className="border-b border-stone-200 bg-white">

                    <div className="mx-auto max-w-6xl px-6 py-12">

                        <button
                            type="button"
                            onClick={() =>
                                router.push('/account')
                            }
                            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900"
                        >

                            <ArrowLeft size={16} />

                            Back to My Account

                        </button>


                        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
                                    My Pearlvera
                                </p>


                                <h1
                                    className="mt-3 text-5xl text-stone-900"
                                    style={{
                                        fontFamily:
                                            'var(--font-playfair)',
                                    }}
                                >
                                    Saved Addresses
                                </h1>


                                <p className="mt-4 max-w-xl text-stone-500">
                                    Manage your delivery addresses.
                                </p>

                            </div>


                            {/* ==================================
                                ADD BUTTON
                            ================================== */}

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-black"
                            >

                                <Plus size={18} />

                                Add New Address

                            </button>

                        </div>

                    </div>

                </section>


                {/* ==================================
                    CONTENT
                ================================== */}

                <section className="mx-auto max-w-6xl px-6 py-14">


                    {error && (

                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                            {error}
                        </div>

                    )}


                    {saved && (

                        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">

                            <Check size={17} />

                            Address saved successfully.

                        </div>

                    )}


                    {/* ==================================
                        FORM
                    ================================== */}

                    {showForm && (

                        <div className="mb-10 rounded-[32px] border border-stone-200 bg-white p-8 shadow-sm sm:p-10">


                            <div className="flex items-start justify-between border-b border-stone-200 pb-7">

                                <div>

                                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                        {editingId
                                            ? 'Edit Address'
                                            : 'New Address'}
                                    </p>


                                    <h2
                                        className="mt-2 text-3xl text-stone-900"
                                        style={{
                                            fontFamily:
                                                'var(--font-playfair)',
                                        }}
                                    >
                                        {editingId
                                            ? 'Update Address'
                                            : 'Add Delivery Address'}
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100"
                                >

                                    <X size={18} />

                                </button>

                            </div>


                            <form
                                onSubmit={handleSave}
                                className="mt-8 space-y-6"
                            >


                                {/* Address Type */}

                                <div>

                                    <label className="mb-3 block text-sm font-medium text-stone-800">
                                        Address Type
                                    </label>


                                    <div className="grid grid-cols-3 gap-3">

                                        <AddressTypeButton
                                            selected={
                                                form.label === 'Home'
                                            }
                                            onClick={() =>
                                                updateField(
                                                    'label',
                                                    'Home'
                                                )
                                            }
                                            icon={
                                                <Home size={18} />
                                            }
                                            label="Home"
                                        />


                                        <AddressTypeButton
                                            selected={
                                                form.label === 'Office'
                                            }
                                            onClick={() =>
                                                updateField(
                                                    'label',
                                                    'Office'
                                                )
                                            }
                                            icon={
                                                <Briefcase size={18} />
                                            }
                                            label="Office"
                                        />


                                        <AddressTypeButton
                                            selected={
                                                form.label === 'Other'
                                            }
                                            onClick={() =>
                                                updateField(
                                                    'label',
                                                    'Other'
                                                )
                                            }
                                            icon={
                                                <MapPinned size={18} />
                                            }
                                            label="Other"
                                        />

                                    </div>

                                </div>


                                {/* Full Name */}

                                <Input
                                    label="Full Name"
                                    value={form.fullName}
                                    onChange={(value) =>
                                        updateField(
                                            'fullName',
                                            value
                                        )
                                    }
                                    placeholder="Recipient's full name"
                                />


                                {/* Phone */}

                                <Input
                                    label="Phone Number"
                                    value={form.phone}
                                    onChange={(value) =>
                                        updateField(
                                            'phone',
                                            value
                                        )
                                    }
                                    placeholder="+91 XXXXX XXXXX"
                                />


                                {/* Street */}

                                <div>

                                    <label
                                        htmlFor="street"
                                        className="mb-2 block text-sm font-medium text-stone-800"
                                    >
                                        Street Address
                                    </label>


                                    <textarea
                                        id="street"
                                        value={form.street}
                                        onChange={(event) =>
                                            updateField(
                                                'street',
                                                event.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="House number, building, street, area"
                                        className="w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-900 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                                    />

                                </div>


                                {/* City + State */}

                                <div className="grid gap-6 sm:grid-cols-2">

                                    <Input
                                        label="City"
                                        value={form.city}
                                        onChange={(value) =>
                                            updateField(
                                                'city',
                                                value
                                            )
                                        }
                                        placeholder="City"
                                    />


                                    <Input
                                        label="State"
                                        value={form.state}
                                        onChange={(value) =>
                                            updateField(
                                                'state',
                                                value
                                            )
                                        }
                                        placeholder="State"
                                    />

                                </div>


                                {/* PIN */}

                                <Input
                                    label="PIN Code"
                                    value={form.pinCode}
                                    onChange={(value) =>
                                        updateField(
                                            'pinCode',
                                            value.replace(
                                                /\D/g,
                                                ''
                                            )
                                        )
                                    }
                                    placeholder="6-digit PIN code"
                                />


                                {/* Buttons */}

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-full bg-stone-900 px-8 py-4 font-medium text-white hover:bg-black disabled:opacity-60"
                                    >

                                        {saving
                                            ? 'Saving...'
                                            : editingId
                                                ? 'Update Address'
                                                : 'Save Address'}

                                    </button>


                                    <button
                                        type="button"
                                        onClick={closeForm}
                                        className="rounded-full border border-stone-300 px-8 py-4 font-medium text-stone-800 hover:bg-stone-100"
                                    >

                                        Cancel

                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    {/* ==================================
                        EMPTY STATE
                    ================================== */}

                    {addresses.length === 0 &&
                        !showForm && (

                            <div className="rounded-[32px] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">

                                <MapPin
                                    size={40}
                                    className="mx-auto text-stone-400"
                                />


                                <h2 className="mt-5 text-2xl font-medium text-stone-900">
                                    No saved addresses
                                </h2>


                                <p className="mt-2 text-stone-500">
                                    Add a delivery address to make checkout faster.
                                </p>


                                <button
                                    type="button"
                                    onClick={openAddForm}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 font-medium text-white hover:bg-black"
                                >

                                    <Plus size={18} />

                                    Add Address

                                </button>

                            </div>

                        )}


                    {/* ==================================
                        SAVED ADDRESSES
                    ================================== */}

                    {addresses.length > 0 && (

                        <div>

                            <div className="mb-6 flex items-end justify-between">

                                <div>

                                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                                        Your Addresses
                                    </p>


                                    <h2
                                        className="mt-2 text-3xl text-stone-900"
                                        style={{
                                            fontFamily:
                                                'var(--font-playfair)',
                                        }}
                                    >
                                        {addresses.length}{' '}
                                        {addresses.length === 1
                                            ? 'Address'
                                            : 'Addresses'}
                                    </h2>

                                </div>

                            </div>


                            <div className="grid gap-6 md:grid-cols-2">

                                {addresses.map(
                                    (address) => (

                                        <div
                                            key={address.id}
                                            className="rounded-[28px] border border-stone-200 bg-white p-7 shadow-sm"
                                        >

                                            {/* Header */}

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-800">

                                                    {address.label === 'Home' ? (
                                                        <Home size={19} />
                                                    ) : address.label === 'Office' ? (
                                                        <Briefcase size={19} />
                                                    ) : (
                                                        <MapPinned size={19} />
                                                    )}

                                                </div>


                                                <div>

                                                    <h3 className="font-semibold text-stone-900">
                                                        {address.label}
                                                    </h3>


                                                    <p className="text-xs text-stone-400">
                                                        Delivery Address
                                                    </p>

                                                </div>

                                            </div>


                                            {/* Details */}

                                            <div className="mt-6 text-sm leading-7 text-stone-600">

                                                <p className="font-medium text-stone-900">
                                                    {address.fullName}
                                                </p>


                                                <p>
                                                    {address.phone}
                                                </p>


                                                <p className="mt-2">
                                                    {address.street}
                                                </p>


                                                <p>
                                                    {address.city},{' '}
                                                    {address.state}
                                                </p>


                                                <p>
                                                    PIN: {address.pinCode}
                                                </p>

                                            </div>


                                            {/* Actions */}

                                            <div className="mt-6 flex gap-3 border-t border-stone-100 pt-5">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditForm(
                                                            address
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-100"
                                                >

                                                    <Pencil size={15} />

                                                    Edit

                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            address.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        address.id
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >

                                                    <Trash2 size={15} />

                                                    {deletingId ===
                                                        address.id
                                                        ? 'Deleting...'
                                                        : 'Delete'}

                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </section>

            </main>


            <Footer />

        </>

    );

}


// ==========================================
// INPUT
// ==========================================

function Input({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {

    return (

        <div>

            <label className="mb-2 block text-sm font-medium text-stone-800">
                {label}
            </label>


            <input
                type="text"
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                placeholder={placeholder}
                className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
            />

        </div>

    );

}


// ==========================================
// ADDRESS TYPE BUTTON
// ==========================================

function AddressTypeButton({
    selected,
    onClick,
    icon,
    label,
}: {
    selected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {

    return (

        <button
            type="button"
            onClick={onClick}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-medium transition ${selected
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                }`}
        >

            {icon}

            {label}

        </button>

    );

}