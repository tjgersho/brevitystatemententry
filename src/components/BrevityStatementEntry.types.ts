import React, { ChangeEventHandler, EventHandler } from "react"

export enum AudienceType{
    Structure,
    Bold,
    Caring,
    Intellect,
}

export enum WordingOptimization {
    Succinctness,
    Compelling,
    Clarity,
    Grammar,
    Aspiration
}

type onSaveType = (a: string) => void;

export interface BSEProps {
    id?: string,
    label?: string,
    error?:boolean,
    success?:boolean,
    disabled?: boolean,
    placeholder?:string,
    onChange?: ChangeEventHandler<HTMLTextAreaElement>,
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>,
    onSave?: onSaveType,
    audience?: AudienceType,
    apiBase?: string,
    textAreaStyles?: any,
    value?: string
    textViewStyles: any,
    optimizeBy?: WordingOptimization
}