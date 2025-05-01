// package: database
// file: database-server.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as database_server_pb from "./database-server_pb";

interface IDatabaseServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    login: IDatabaseServiceService_ILogin;
    register: IDatabaseServiceService_IRegister;
    savePatientInfo: IDatabaseServiceService_ISavePatientInfo;
    getPatient: IDatabaseServiceService_IGetPatient;
}

interface IDatabaseServiceService_ILogin extends grpc.MethodDefinition<database_server_pb.LoginRequest, database_server_pb.LoginResponse> {
    path: "/database.DatabaseService/Login";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<database_server_pb.LoginRequest>;
    requestDeserialize: grpc.deserialize<database_server_pb.LoginRequest>;
    responseSerialize: grpc.serialize<database_server_pb.LoginResponse>;
    responseDeserialize: grpc.deserialize<database_server_pb.LoginResponse>;
}
interface IDatabaseServiceService_IRegister extends grpc.MethodDefinition<database_server_pb.RegisterRequest, database_server_pb.RegisterResponse> {
    path: "/database.DatabaseService/Register";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<database_server_pb.RegisterRequest>;
    requestDeserialize: grpc.deserialize<database_server_pb.RegisterRequest>;
    responseSerialize: grpc.serialize<database_server_pb.RegisterResponse>;
    responseDeserialize: grpc.deserialize<database_server_pb.RegisterResponse>;
}
interface IDatabaseServiceService_ISavePatientInfo extends grpc.MethodDefinition<database_server_pb.SavePatientInfoRequest, database_server_pb.SavePatientInfoResponse> {
    path: "/database.DatabaseService/SavePatientInfo";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<database_server_pb.SavePatientInfoRequest>;
    requestDeserialize: grpc.deserialize<database_server_pb.SavePatientInfoRequest>;
    responseSerialize: grpc.serialize<database_server_pb.SavePatientInfoResponse>;
    responseDeserialize: grpc.deserialize<database_server_pb.SavePatientInfoResponse>;
}
interface IDatabaseServiceService_IGetPatient extends grpc.MethodDefinition<database_server_pb.GetPatientRequest, database_server_pb.GetPatientResponse> {
    path: "/database.DatabaseService/GetPatient";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<database_server_pb.GetPatientRequest>;
    requestDeserialize: grpc.deserialize<database_server_pb.GetPatientRequest>;
    responseSerialize: grpc.serialize<database_server_pb.GetPatientResponse>;
    responseDeserialize: grpc.deserialize<database_server_pb.GetPatientResponse>;
}

export const DatabaseServiceService: IDatabaseServiceService;

export interface IDatabaseServiceServer {
    login: grpc.handleUnaryCall<database_server_pb.LoginRequest, database_server_pb.LoginResponse>;
    register: grpc.handleUnaryCall<database_server_pb.RegisterRequest, database_server_pb.RegisterResponse>;
    savePatientInfo: grpc.handleUnaryCall<database_server_pb.SavePatientInfoRequest, database_server_pb.SavePatientInfoResponse>;
    getPatient: grpc.handleUnaryCall<database_server_pb.GetPatientRequest, database_server_pb.GetPatientResponse>;
}

export interface IDatabaseServiceClient {
    login(request: database_server_pb.LoginRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    login(request: database_server_pb.LoginRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    login(request: database_server_pb.LoginRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    register(request: database_server_pb.RegisterRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    register(request: database_server_pb.RegisterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    register(request: database_server_pb.RegisterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    savePatientInfo(request: database_server_pb.SavePatientInfoRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    savePatientInfo(request: database_server_pb.SavePatientInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    savePatientInfo(request: database_server_pb.SavePatientInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    getPatient(request: database_server_pb.GetPatientRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
    getPatient(request: database_server_pb.GetPatientRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
    getPatient(request: database_server_pb.GetPatientRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
}

export class DatabaseServiceClient extends grpc.Client implements IDatabaseServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public login(request: database_server_pb.LoginRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    public login(request: database_server_pb.LoginRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    public login(request: database_server_pb.LoginRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.LoginResponse) => void): grpc.ClientUnaryCall;
    public register(request: database_server_pb.RegisterRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    public register(request: database_server_pb.RegisterRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    public register(request: database_server_pb.RegisterRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.RegisterResponse) => void): grpc.ClientUnaryCall;
    public savePatientInfo(request: database_server_pb.SavePatientInfoRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    public savePatientInfo(request: database_server_pb.SavePatientInfoRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    public savePatientInfo(request: database_server_pb.SavePatientInfoRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.SavePatientInfoResponse) => void): grpc.ClientUnaryCall;
    public getPatient(request: database_server_pb.GetPatientRequest, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
    public getPatient(request: database_server_pb.GetPatientRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
    public getPatient(request: database_server_pb.GetPatientRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: database_server_pb.GetPatientResponse) => void): grpc.ClientUnaryCall;
}
