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
    disabled?: boolean,
    placeholder?:string,
    onChange?: ChangeEventHandler<HTMLTextAreaElement>,
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>,
    setTextAreaInput?: any,
    reference?: any,
    onSave?: onSaveType,
    audience?: AudienceType,
    apiBase?: string,
    textAreaStyles?: any,
    textViewStyles: any,
    value?: string,
    optimizeBy?: WordingOptimization,
    active?: boolean,
    showSave?: boolean,
    doSuggestionList?: boolean,
    editMode?: boolean,
    btnStyles?: any
}