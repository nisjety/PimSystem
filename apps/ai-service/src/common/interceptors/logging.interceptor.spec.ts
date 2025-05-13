import { Test, TestingModule } from "@nestjs/testing";
import {
  ExecutionContext,
  CallHandler,
  Logger,
  LoggerService,
} from "@nestjs/common";
import { LoggingInterceptor } from "./logging.interceptor";
import { of, throwError } from "rxjs";

describe("LoggingInterceptor", () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    // Mock the Logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    // Create a new instance of LoggingInterceptor for each test
    interceptor = new LoggingInterceptor();
    // Replace the logger with our mock
    (interceptor as any).logger = mockLogger;
  });

  it("should be defined", () => {
    expect(interceptor).toBeDefined();
  });

  it("should log request and successful response", (done) => {
    const mockRequest = {
      method: "GET",
      url: "/test",
      body: { test: "data" },
      query: { page: "1" },
      headers: { "content-type": "application/json" },
    };

    const mockResponse = {
      statusCode: 200,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of({ result: "success" }),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => {
        expect(mockLogger.log).toHaveBeenCalledTimes(2);
        // Verify request log
        expect(mockLogger.log).toHaveBeenCalledWith({
          type: "Request",
          method: "GET",
          url: "/test",
          body: { test: "data" },
          query: { page: "1" },
          headers: { "content-type": "application/json" },
        });
        // Verify response log
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "Response",
            method: "GET",
            url: "/test",
            statusCode: 200,
            body: { result: "success" },
          }),
        );
        done();
      },
    });
  });

  it("should log request and error response", (done) => {
    const mockRequest = {
      method: "POST",
      url: "/test",
      body: { test: "data" },
      query: {},
      headers: {},
    };

    const mockResponse = {
      statusCode: 500,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockError = new Error("Test error");
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => mockError),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: () => {
        expect(mockLogger.log).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledTimes(1);
        // Verify request log
        expect(mockLogger.log).toHaveBeenCalledWith({
          type: "Request",
          method: "POST",
          url: "/test",
          body: { test: "data" },
          query: {},
          headers: {},
        });
        // Verify error log
        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "Error Response",
            method: "POST",
            url: "/test",
            statusCode: 500,
            error: {
              message: "Test error",
              stack: expect.any(String),
            },
          }),
        );
        done();
      },
    });
  });
});
