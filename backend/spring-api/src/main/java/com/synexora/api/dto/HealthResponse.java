package com.synexora.api.dto;

import java.time.Instant;
import java.util.List;

public class HealthResponse {
    private String status;
    private String service;
    private String version;
    private List<String> modules;
    private Instant timestamp;

    public HealthResponse() {
    }

    public HealthResponse(String status, String service, String version, List<String> modules, Instant timestamp) {
        this.status = status;
        this.service = service;
        this.version = version;
        this.modules = modules;
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<String> getModules() {
        return modules;
    }

    public void setModules(List<String> modules) {
        this.modules = modules;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
