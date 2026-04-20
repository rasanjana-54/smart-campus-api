package com.smartcampus.mapper;

// Custom exception for 422: Validating payload logic failures
public class UnprocessableEntityException extends RuntimeException {
    public UnprocessableEntityException(String message) {
        super(message);
    }
}
