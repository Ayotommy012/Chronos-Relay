# Chronos Relay

> A Redis-cached, rate-limited financial data proxy built with NestJS and TypeScript.

Chronos Relay is a backend service that sits between client applications and external financial data providers. It provides a controlled API layer with **Redis caching, request throttling, response transformation, and upstream API abstraction**.

The service is designed to reduce unnecessary requests to third-party providers while exposing a consistent internal API to consuming applications.

## Live Resources

* **Live API:** [View Deployment]([YOUR_RENDER_UR](https://chronos-relay.onrender.com)L)
* **API Documentation:** [Postman Documentation]([YOUR_POSTMAN_DOCUMENTATION_URL](https://documenter.getpostman.com/view/47120294/2sBYAvu9nN))

## Engineering Highlights

* **Redis-backed caching** for frequently requested financial data
* **TTL-based cache invalidation** to balance data freshness and upstream request volume
* **IP-based rate limiting** using NestJS Throttler
* **External API integration** using NestJS Axios
* **Response transformation** into a consistent internal data contract
* **Environment-based configuration** for external service credentials
* **Dockerized application** for consistent runtime environments
* **Automated CI pipeline** for linting, testing, and build verification
* Modular NestJS architecture using controllers, services, modules, and dependency injection

## Architecture

```text
                     ┌──────────────────┐
                     │      Client      │
                     └────────┬─────────┘
                              │
                              │ HTTP Request
                              ▼
                     ┌──────────────────┐
                     │  Chronos Relay   │
                     │     NestJS       │
                     └────────┬─────────┘
                              │
                       Rate Limiting
                              │
                              ▼
                     ┌──────────────────┐
                     │   Redis Cache    │
                     └───────┬──────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
              Cache Hit             Cache Miss
                  │                     │
                  │                     ▼
                  │           ┌──────────────────┐
                  │           │ External Finance │
                  │           │       API        │
                  │           └────────┬─────────┘
                  │                    │
                  │             Transform Data
                  │                    │
                  │                    ▼
                  │              Cache Result
                  │                    │
                  └──────────┬─────────┘
                             │
                             ▼
                     ┌──────────────────┐
                     │   JSON Response  │
                     └──────────────────┘
```

## Request Flow

When a client requests financial asset data, Chronos Relay first checks whether a valid cached response is available.

### Cache Hit

```text
Client Request
      ↓
Rate Limiter
      ↓
Redis Lookup
      ↓
Cached Data Found
      ↓
Return Response
```

No request to the external provider is required.

### Cache Miss

```text
Client Request
      ↓
Rate Limiter
      ↓
Redis Lookup
      ↓
Cache Miss
      ↓
External Financial API
      ↓
Transform Response
      ↓
Store in Redis
      ↓
Return Response
```

This design prevents identical requests from unnecessarily reaching the external provider while keeping the client-facing API independent of the upstream provider's response structure.

## Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Language          | TypeScript              |
| Runtime           | Node.js                 |
| Framework         | NestJS                  |
| Cache             | Redis                   |
| HTTP Client       | Axios / `@nestjs/axios` |
| Rate Limiting     | `@nestjs/throttler`     |
| Testing           | Jest                    |
| Containerization  | Docker                  |
| CI                | GitHub Actions          |
| Deployment        | Render                  |
| API Documentation | Postman                 |

## API

### Get Asset Data

```http
GET /api/v1/assets/:ticker
```

Retrieves financial data for the specified asset.

Example:

```http
GET /api/v1/assets/EUR
```

### Path Parameters

| Parameter | Type   | Required | Description                                      |
| --------- | ------ | -------- | ------------------------------------------------ |
| `ticker`  | string | Yes      | Asset ticker to retrieve, such as `EUR` or `GBP` |

### Example Response

```json
{
  "asset": "EUR",
  "baseCurrency": "USD",
  "rate": 0.92,
  "timestamp": "2026-08-29T23:15:00Z",
  "source": "external-provider"
}
```

### Response Codes

| Status                  | Meaning                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `200 OK`                | Asset data retrieved successfully                                  |
| `404 Not Found`         | Requested ticker was not found                                     |
| `429 Too Many Requests` | Client exceeded the configured rate limit                          |
| `502 Bad Gateway`       | Upstream financial data provider could not be reached successfully |

For interactive request documentation and examples, see the **published Postman documentation** linked above.

## Caching Strategy

Chronos Relay uses Redis to cache asset lookups.

Cached responses are stored with a configured **Time-To-Live (TTL)**. During the TTL window, repeated requests for the same asset can be served from Redis rather than triggering another external API request.

Once the cached entry expires, the next request retrieves fresh data from the upstream provider and updates the cache.

This provides a balance between:

* data freshness
* response efficiency
* upstream API usage
* protection against provider rate limits

## Rate Limiting

Chronos Relay uses `@nestjs/throttler` to apply IP-based request limits.

Rate limiting protects the service from excessive request traffic and helps prevent clients from indirectly exhausting the quota of the upstream financial data provider.

Requests exceeding the configured threshold receive:

```http
429 Too Many Requests
```

## Response Transformation

External providers often expose response structures that clients should not need to understand or depend on.

Chronos Relay transforms provider responses into a smaller internal contract:

```json
{
  "asset": "EUR",
  "baseCurrency": "USD",
  "rate": 0.92,
  "timestamp": "2026-08-29T23:15:00Z",
  "source": "external-provider"
}
```

This decouples consuming applications from the external provider and allows the upstream implementation to change without requiring corresponding changes across every client.

## Getting Started

### Prerequisites

You will need:

* Node.js
* Yarn
* Redis
* Docker, if using the containerized setup

### Clone the Repository

```bash
git clone https://github.com/Ayotommy012/chronos-relay.git
cd chronos-relay
```

### Install Dependencies

```bash
yarn install
```

### Environment Configuration

Configure the environment variables required by the application and external financial data provider.

Do not commit credentials or secrets to source control.

### Run in Development

```bash
yarn start:dev
```

The API will be available locally at:

```text
http://localhost:3000
```

## Testing

Run the unit test suite:

```bash
yarn test
```

Run tests serially:

```bash
yarn test --runInBand
```

Run end-to-end tests:

```bash
yarn test:e2e
```

Generate test coverage:

```bash
yarn test:cov
```

## Code Quality

Run ESLint:

```bash
yarn lint
```

The project is configured to enforce TypeScript code-quality and type-safety rules, including checks against unsafe access to untyped external API responses.

## Continuous Integration

Chronos Relay uses **GitHub Actions** to automatically validate changes pushed to the repository.

The CI pipeline performs:

```text
Checkout
   ↓
Install Dependencies
   ↓
Lint
   ↓
Unit Tests
   ↓
Production Build
```

A change must successfully pass the project's linting, automated tests, and production build process for the CI workflow to complete successfully.

## Docker

Build the Docker image:

```bash
docker build -t chronos-relay .
```

Run the container:

```bash
docker run -p 3000:3000 chronos-relay
```

Required environment variables should be supplied securely when running the container.

## Deployment

Chronos Relay is deployed on **Render**.

The production deployment provides a publicly accessible instance of the API for testing and integration.

See **Live Resources** at the top of this README for the deployed API and interactive Postman documentation.

## Project Status

* [x] NestJS application architecture
* [x] External financial API integration
* [x] Asset retrieval API
* [x] Typed external API responses
* [x] Redis caching
* [x] TTL-based cache expiration
* [x] IP-based request throttling
* [x] Response transformation
* [x] Docker configuration
* [x] Unit testing
* [x] ESLint / TypeScript quality checks
* [x] Published Postman API documentation
* [x] Production deployment on Render
* [x] GitHub Actions CI
* [ ] Expanded integration and end-to-end test coverage
* [ ] Structured production observability

## Future Improvements

* Expand integration and end-to-end testing
* Add structured application logging
* Add request tracing and operational metrics
* Add cache hit/miss observability
* Add upstream-provider health monitoring
* Support additional financial data providers
* Introduce provider fallback strategies

## Engineering Focus

Chronos Relay explores backend infrastructure concerns that arise when applications depend on third-party services:

**caching · rate limiting · API abstraction · external service integration · response normalization · reliability**

Rather than exposing an external provider directly to clients, Chronos Relay provides an intermediary layer that can evolve independently of both the client and upstream service.
