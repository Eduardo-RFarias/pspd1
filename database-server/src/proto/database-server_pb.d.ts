// package: database
// file: database-server.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class LoginRequest extends jspb.Message { 
    getUsername(): string;
    setUsername(value: string): LoginRequest;
    getPassword(): string;
    setPassword(value: string): LoginRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LoginRequest.AsObject;
    static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LoginRequest;
    static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
    export type AsObject = {
        username: string,
        password: string,
    }
}

export class LoginResponse extends jspb.Message { 
    getToken(): string;
    setToken(value: string): LoginResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): LoginResponse.AsObject;
    static toObject(includeInstance: boolean, msg: LoginResponse): LoginResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: LoginResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): LoginResponse;
    static deserializeBinaryFromReader(message: LoginResponse, reader: jspb.BinaryReader): LoginResponse;
}

export namespace LoginResponse {
    export type AsObject = {
        token: string,
    }
}

export class RegisterRequest extends jspb.Message { 
    getUsername(): string;
    setUsername(value: string): RegisterRequest;
    getPassword(): string;
    setPassword(value: string): RegisterRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterRequest.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterRequest): RegisterRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterRequest;
    static deserializeBinaryFromReader(message: RegisterRequest, reader: jspb.BinaryReader): RegisterRequest;
}

export namespace RegisterRequest {
    export type AsObject = {
        username: string,
        password: string,
    }
}

export class RegisterResponse extends jspb.Message { 
    getToken(): string;
    setToken(value: string): RegisterResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): RegisterResponse.AsObject;
    static toObject(includeInstance: boolean, msg: RegisterResponse): RegisterResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: RegisterResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): RegisterResponse;
    static deserializeBinaryFromReader(message: RegisterResponse, reader: jspb.BinaryReader): RegisterResponse;
}

export namespace RegisterResponse {
    export type AsObject = {
        token: string,
    }
}

export class SavePatientInfoRequest extends jspb.Message { 
    getToken(): string;
    setToken(value: string): SavePatientInfoRequest;

    hasPatientInfo(): boolean;
    clearPatientInfo(): void;
    getPatientInfo(): PatientInfo | undefined;
    setPatientInfo(value?: PatientInfo): SavePatientInfoRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SavePatientInfoRequest.AsObject;
    static toObject(includeInstance: boolean, msg: SavePatientInfoRequest): SavePatientInfoRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SavePatientInfoRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SavePatientInfoRequest;
    static deserializeBinaryFromReader(message: SavePatientInfoRequest, reader: jspb.BinaryReader): SavePatientInfoRequest;
}

export namespace SavePatientInfoRequest {
    export type AsObject = {
        token: string,
        patientInfo?: PatientInfo.AsObject,
    }
}

export class SavePatientInfoResponse extends jspb.Message { 
    getSuccess(): boolean;
    setSuccess(value: boolean): SavePatientInfoResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SavePatientInfoResponse.AsObject;
    static toObject(includeInstance: boolean, msg: SavePatientInfoResponse): SavePatientInfoResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SavePatientInfoResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SavePatientInfoResponse;
    static deserializeBinaryFromReader(message: SavePatientInfoResponse, reader: jspb.BinaryReader): SavePatientInfoResponse;
}

export namespace SavePatientInfoResponse {
    export type AsObject = {
        success: boolean,
    }
}

export class GetPatientRequest extends jspb.Message { 
    getToken(): string;
    setToken(value: string): GetPatientRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPatientRequest.AsObject;
    static toObject(includeInstance: boolean, msg: GetPatientRequest): GetPatientRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPatientRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPatientRequest;
    static deserializeBinaryFromReader(message: GetPatientRequest, reader: jspb.BinaryReader): GetPatientRequest;
}

export namespace GetPatientRequest {
    export type AsObject = {
        token: string,
    }
}

export class GetPatientResponse extends jspb.Message { 

    hasPatientInfo(): boolean;
    clearPatientInfo(): void;
    getPatientInfo(): PatientInfo | undefined;
    setPatientInfo(value?: PatientInfo): GetPatientResponse;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GetPatientResponse.AsObject;
    static toObject(includeInstance: boolean, msg: GetPatientResponse): GetPatientResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GetPatientResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GetPatientResponse;
    static deserializeBinaryFromReader(message: GetPatientResponse, reader: jspb.BinaryReader): GetPatientResponse;
}

export namespace GetPatientResponse {
    export type AsObject = {
        patientInfo?: PatientInfo.AsObject,
    }
}

export class PatientInfo extends jspb.Message { 
    getName(): string;
    setName(value: string): PatientInfo;
    getAge(): number;
    setAge(value: number): PatientInfo;
    getGender(): string;
    setGender(value: string): PatientInfo;
    getWeight(): number;
    setWeight(value: number): PatientInfo;
    getHeight(): number;
    setHeight(value: number): PatientInfo;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): PatientInfo.AsObject;
    static toObject(includeInstance: boolean, msg: PatientInfo): PatientInfo.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: PatientInfo, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): PatientInfo;
    static deserializeBinaryFromReader(message: PatientInfo, reader: jspb.BinaryReader): PatientInfo;
}

export namespace PatientInfo {
    export type AsObject = {
        name: string,
        age: number,
        gender: string,
        weight: number,
        height: number,
    }
}
