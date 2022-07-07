import React, { ChangeEventHandler, EventHandler } from "react"

export enum AudienceType{
    Structure,
    Bold,
    Caring,
    Intellect,
}

export interface BSEProps {
    id?: string,
    label?: string,
    error?:boolean,
    success?:boolean,
    disabled?: boolean,
    placeholder?:string,
    onChange?: ChangeEventHandler<HTMLTextAreaElement>,
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>,
    audience?: AudienceType,
    apiBase?: string,
    textAreaStyles?: any
}