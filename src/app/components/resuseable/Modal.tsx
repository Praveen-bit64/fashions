"use client";
import Icon from "./Icons";
import { useEffect, useState } from "react";

interface ModalProps {
    children: React.ReactNode;
    className: string;
    blurQuantity?: 'sm' | 'md' | 'lg' | 'xl';
    bgdarkQuantity?: number;
    isOpen?: boolean;
    setModalStatusCallback: any;
}

const Modal = (props: ModalProps) => {
    const { children, className = '', blurQuantity = 'md', bgdarkQuantity = 50, isOpen = false, setModalStatusCallback } = props;
    const [isOpenModal, setIsOpenModal] = useState(isOpen);
    console.log(isOpenModal, 'isOpenModal');
    useEffect(() => {
        setIsOpenModal(isOpen);
    }, [isOpen]);
    if (!isOpenModal) {
        return null;
    }
    const handleClose = () => {
        setIsOpenModal(!isOpenModal);
        setModalStatusCallback(isOpenModal);
    }
    return (
        <div className={`fixed inset-0 bg-black/${bgdarkQuantity} backdrop-blur-${blurQuantity} z-[9999] flex justify-center items-center p-2 sm:p-4 top-0`}>
            <Icon onClick={handleClose} name="close" className="absolute top-5 right-5 text-2xl cursor-pointer bg-white rounded-full p-1" />
            <div className={`${className}`}>
                {children}
            </div>
        </div>
    );
}

export default Modal;