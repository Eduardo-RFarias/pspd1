import {
  sendUnaryData,
  ServerUnaryCall,
  UntypedHandleCall,
} from "@grpc/grpc-js";
import { hash, verify } from "argon2";
import { JwtPayload, verify as jwtVerify, sign } from "jsonwebtoken";
import prisma from "./prisma";
import { IDatabaseServiceServer } from "./proto/database-server_grpc_pb";
import {
  GetPatientRequest,
  GetPatientResponse,
  LoginRequest,
  LoginResponse,
  PatientInfo,
  RegisterRequest,
  RegisterResponse,
  SavePatientInfoRequest,
  SavePatientInfoResponse,
} from "./proto/database-server_pb";

// Implementation of the DatabaseService
export default class DatabaseServiceImpl implements IDatabaseServiceServer {
  [method: string]: UntypedHandleCall;

  // Login method implementation
  async login(
    call: ServerUnaryCall<LoginRequest, LoginResponse>,
    callback: sendUnaryData<LoginResponse>
  ): Promise<void> {
    try {
      const username = call.request.getUsername();
      const password = call.request.getPassword();

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        const error = new Error("User not found");
        callback(error, null);
        return;
      }

      const isPasswordValid = await verify(user.password, password);

      if (!isPasswordValid) {
        const error = new Error("Invalid password");
        callback(error, null);
        return;
      }

      const token = sign({}, process.env.JWT_SECRET!, {
        expiresIn: "1H",
        subject: user.id.toString(),
        audience: "database-server",
        issuer: "database-server",
      });

      const response = new LoginResponse();
      response.setToken(token);

      callback(null, response);
    } catch (error) {
      console.error(error);
      callback(new Error("Internal server error"), null);
    }
  }

  // Register method implementation
  async register(
    call: ServerUnaryCall<RegisterRequest, RegisterResponse>,
    callback: sendUnaryData<RegisterResponse>
  ): Promise<void> {
    try {
      const username = call.request.getUsername();
      const password = call.request.getPassword();

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (user) {
        const error = new Error("User already exists");
        callback(error, null);
        return;
      }

      const hashedPassword = await hash(password);

      const newUser = await prisma.user.create({
        data: { username, password: hashedPassword },
      });

      const token = sign({}, process.env.JWT_SECRET!, {
        expiresIn: "1H",
        subject: newUser.id.toString(),
        audience: "database-server",
        issuer: "database-server",
      });

      const response = new RegisterResponse();
      response.setToken(token);

      callback(null, response);
    } catch (error) {
      console.error(error);
      callback(new Error("Internal server error"), null);
    }
  }

  // SavePatientInfo method implementation
  async savePatientInfo(
    call: ServerUnaryCall<SavePatientInfoRequest, SavePatientInfoResponse>,
    callback: sendUnaryData<SavePatientInfoResponse>
  ): Promise<void> {
    try {
      const token = call.request.getToken();
      const patientInfo = call.request.getPatientInfo();

      if (!patientInfo) {
        const error = new Error("Patient info is required");
        callback(error, null);
        return;
      }

      const decoded = jwtVerify(token, process.env.JWT_SECRET!);
      const userId = (decoded as JwtPayload).sub;

      if (userId === undefined) {
        const error = new Error("Invalid token");
        callback(error, null);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        const error = new Error("User not found");
        callback(error, null);
        return;
      }

      await prisma.patient.create({
        data: {
          name: patientInfo.getName(),
          age: patientInfo.getAge(),
          gender: patientInfo.getGender(),
          weight: patientInfo.getWeight(),
          height: patientInfo.getHeight(),
          user: {
            connect: {
              id: parseInt(userId),
            },
          },
        },
      });

      const response = new SavePatientInfoResponse();
      response.setSuccess(true);

      callback(null, response);
    } catch (error) {
      console.error(error);
      callback(new Error("Internal server error"), null);
    }
  }

  // GetPatient method implementation
  async getPatient(
    call: ServerUnaryCall<GetPatientRequest, GetPatientResponse>,
    callback: sendUnaryData<GetPatientResponse>
  ): Promise<void> {
    try {
      const token = call.request.getToken();

      if (!token) {
        const error = new Error("Token is required");
        callback(error, null);
        return;
      }

      const decoded = jwtVerify(token, process.env.JWT_SECRET!);
      const userId = (decoded as JwtPayload).sub;

      if (userId === undefined) {
        const error = new Error("Invalid token");
        callback(error, null);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        const error = new Error("User not found");
        callback(error, null);
        return;
      }

      const patient = await prisma.patient.findFirst({
        where: { userId: parseInt(userId) },
      });

      if (!patient) {
        const error = new Error("Patient not found");
        callback(error, null);
        return;
      }

      const patientInfo = new PatientInfo();
      patientInfo.setName(patient.name);
      patientInfo.setAge(patient.age);
      patientInfo.setGender(patient.gender);
      patientInfo.setWeight(patient.weight);
      patientInfo.setHeight(patient.height);

      const response = new GetPatientResponse();
      response.setPatientInfo(patientInfo);

      callback(null, response);
    } catch (error) {
      console.error(error);
      callback(new Error("Internal server error"), null);
    }
  }
}
