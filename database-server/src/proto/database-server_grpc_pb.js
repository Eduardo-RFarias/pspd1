// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var database$server_pb = require('./database-server_pb.js');

function serialize_database_GetPatientRequest(arg) {
  if (!(arg instanceof database$server_pb.GetPatientRequest)) {
    throw new Error('Expected argument of type database.GetPatientRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_GetPatientRequest(buffer_arg) {
  return database$server_pb.GetPatientRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_GetPatientResponse(arg) {
  if (!(arg instanceof database$server_pb.GetPatientResponse)) {
    throw new Error('Expected argument of type database.GetPatientResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_GetPatientResponse(buffer_arg) {
  return database$server_pb.GetPatientResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_LoginRequest(arg) {
  if (!(arg instanceof database$server_pb.LoginRequest)) {
    throw new Error('Expected argument of type database.LoginRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_LoginRequest(buffer_arg) {
  return database$server_pb.LoginRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_LoginResponse(arg) {
  if (!(arg instanceof database$server_pb.LoginResponse)) {
    throw new Error('Expected argument of type database.LoginResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_LoginResponse(buffer_arg) {
  return database$server_pb.LoginResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_RegisterRequest(arg) {
  if (!(arg instanceof database$server_pb.RegisterRequest)) {
    throw new Error('Expected argument of type database.RegisterRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_RegisterRequest(buffer_arg) {
  return database$server_pb.RegisterRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_RegisterResponse(arg) {
  if (!(arg instanceof database$server_pb.RegisterResponse)) {
    throw new Error('Expected argument of type database.RegisterResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_RegisterResponse(buffer_arg) {
  return database$server_pb.RegisterResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_SavePatientInfoRequest(arg) {
  if (!(arg instanceof database$server_pb.SavePatientInfoRequest)) {
    throw new Error('Expected argument of type database.SavePatientInfoRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_SavePatientInfoRequest(buffer_arg) {
  return database$server_pb.SavePatientInfoRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_database_SavePatientInfoResponse(arg) {
  if (!(arg instanceof database$server_pb.SavePatientInfoResponse)) {
    throw new Error('Expected argument of type database.SavePatientInfoResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_database_SavePatientInfoResponse(buffer_arg) {
  return database$server_pb.SavePatientInfoResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var DatabaseServiceService = exports.DatabaseServiceService = {
  login: {
    path: '/database.DatabaseService/Login',
    requestStream: false,
    responseStream: false,
    requestType: database$server_pb.LoginRequest,
    responseType: database$server_pb.LoginResponse,
    requestSerialize: serialize_database_LoginRequest,
    requestDeserialize: deserialize_database_LoginRequest,
    responseSerialize: serialize_database_LoginResponse,
    responseDeserialize: deserialize_database_LoginResponse,
  },
  register: {
    path: '/database.DatabaseService/Register',
    requestStream: false,
    responseStream: false,
    requestType: database$server_pb.RegisterRequest,
    responseType: database$server_pb.RegisterResponse,
    requestSerialize: serialize_database_RegisterRequest,
    requestDeserialize: deserialize_database_RegisterRequest,
    responseSerialize: serialize_database_RegisterResponse,
    responseDeserialize: deserialize_database_RegisterResponse,
  },
  savePatientInfo: {
    path: '/database.DatabaseService/SavePatientInfo',
    requestStream: false,
    responseStream: false,
    requestType: database$server_pb.SavePatientInfoRequest,
    responseType: database$server_pb.SavePatientInfoResponse,
    requestSerialize: serialize_database_SavePatientInfoRequest,
    requestDeserialize: deserialize_database_SavePatientInfoRequest,
    responseSerialize: serialize_database_SavePatientInfoResponse,
    responseDeserialize: deserialize_database_SavePatientInfoResponse,
  },
  getPatient: {
    path: '/database.DatabaseService/GetPatient',
    requestStream: false,
    responseStream: false,
    requestType: database$server_pb.GetPatientRequest,
    responseType: database$server_pb.GetPatientResponse,
    requestSerialize: serialize_database_GetPatientRequest,
    requestDeserialize: deserialize_database_GetPatientRequest,
    responseSerialize: serialize_database_GetPatientResponse,
    responseDeserialize: deserialize_database_GetPatientResponse,
  },
};

exports.DatabaseServiceClient = grpc.makeGenericClientConstructor(DatabaseServiceService, 'DatabaseService');
