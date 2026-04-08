<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

/////////

dự án backend_cv của tôi đang theo câu trúc gì @src/
dir src/
Thinking: The user is asking about the structure of their backend_cv project. Based on the directory listing they provided, I can see the structure of the src/ folder.
Let me analyze the structure:

- app.controller.spec.ts, app.controller.ts, app.module.ts, app.service.ts - These are NestJS boilerplate files
- application/ - likely contains application services/use cases
- domain/ - likely contains entities, interfaces, business logic
- infrastructure/ - likely contains infrastructure implementations (DB, external services)
- modules/ - likely contains feature modules
- shared/ - likely contains shared utilities, guards, filters, etc.
- main.ts - Entry point
  This looks like a Clean Architecture / Hexagonal Architecture pattern used in NestJS.
  I should provide a concise answer about the architecture pattern being used.
  Dự án theo cấu trúc Clean Architecture (Hexagonal Architecture) trong NestJS với các thư mục chính:
- application/ - Application services, use cases
- domain/ - Entities, interfaces, business logic
- infrastructure/ - Infrastructure (DB, external services)
- modules/ - Feature modules
- shared/ - Shared utilities, guards, filters, DTOs
  Đây là kiến trúc phân lớp rõ ràng, tách biệt logic nghiệp vụ khỏi infrastructure.
  ▣ Build · minimax-m2.5-free · 7.1s
  giải thích nhiệm vụ tằng cấu trúc đi
  Thinking: The user wants me to explain the purpose of each layer in the Clean Architecture structure of their backend_cv project.
  Nhiệm vụ từng thư mục trong Clean Architecture:
  Thư mục Nhiệm vụ
  domain/ Chứa entities, interfaces, business rules - lõi nghiệp vụ, không phụ thuộc bất kỳ lớp nào khác
  application/ Chứa use cases, application services - điều phối domain, xử lý nghiệp vụ
  infrastructure/ Chứa implementations cụ thể: database, external APIs, repositories
  modules/ Chứa các feature modules của NestJS (auth, users, jobs...)
  shared/ Chứa code dùng chung: DTOs, guards, filters, constants, helpers
  app.controller/service/module Entry point của NestJS app
  Luồng dữ liệu: modules → application → domain ← infrastructure
  domain là lớp trung tâm, không phụ thuộc các lớp khác. infrastructure implement các interface trong domain.
