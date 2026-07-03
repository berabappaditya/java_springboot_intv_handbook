// =============================================================
// data.js — All handbook content lives here.
// To add your real Q&A: replace the `question` and `answer`
// fields inside each category's `questions` array.
// Each answer supports ```java ... ``` fenced code blocks,
// **bold**, *italic*, `inline code`, tables, and - / 1. lists.
// NOTE: the renderer is a mini-markdown parser (see app.js).
//   * Do NOT use ### headings or --- rules — use a **bold line**
//     and blank lines instead.
//   * Escape literal ${...} in Java code as \${...} (template literal).
// =============================================================

const HANDBOOK_DATA = [
  {
    id: "annotations-easy",
    title: "Spring Boot Annotations — Easy",
    icon: "🌱",
    questions: [
      {
        id: "ae-1",
        question: "What does @SpringBootApplication do?",
        answer: `In plain English, \`@SpringBootApplication\` is the single annotation you put on your main class to "turn on" Spring Boot. It replaces three annotations you would otherwise have to write by hand, so your application starts with almost no boilerplate.

It is a **meta-annotation** — an annotation made of other annotations. It bundles three:

| Annotation it includes | What it does |
|---|---|
| **@Configuration** | Marks the class as a source of bean definitions (a place where you can declare @Bean methods). |
| **@EnableAutoConfiguration** | Tells Spring Boot to look at the libraries on your classpath and auto-configure sensible beans (e.g. see \`spring-web\` → set up an embedded Tomcat + DispatcherServlet). |
| **@ComponentScan** | Scans this class's package and all sub-packages for your \`@Component\` / \`@Service\` / \`@Repository\` / \`@Controller\` classes and registers them. |

**Example in Action**

\`\`\`java
@SpringBootApplication
public class MyApp {
    public static void main(String[] args) {
        // Boots the whole application: starts the container,
        // runs auto-configuration, scans for your components,
        // and (for web apps) starts the embedded server.
        SpringApplication.run(MyApp.class, args);
    }
}
\`\`\`

If some auto-configuration gets in your way, you can switch it off with \`exclude\`:

\`\`\`java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class MyApp { }
\`\`\`

**Common gotcha:** component scanning only covers the package of this class and everything below it. Keep your main class in the **root/top package** of your project, otherwise some of your beans will silently not be found.`,
        difficulty: "easy",
        tags: ["annotations", "spring-boot", "auto-configuration"]
      },
      {
        id: "ae-2",
        question: "What is the difference between @Component, @Service, @Repository, and @Controller?",
        answer: `All four tell Spring "create an object of this class and manage it for me" (this managed object is called a **bean**). Under the hood they are the *same* thing — \`@Service\`, \`@Repository\`, and \`@Controller\` are just specialized versions of \`@Component\`. So why have four? Mostly to communicate **intent**: reading the annotation tells you which layer a class belongs to. A couple of them also add real behavior.

Think of a typical app in layers: Controller (handles web requests) → Service (business rules) → Repository (talks to the database).

| Annotation | Which layer / purpose | Extra behavior beyond @Component |
|---|---|---|
| **@Component** | Any generic Spring-managed bean | None |
| **@Service** | Business-logic layer | None (it is purely a label for readability) |
| **@Repository** | Data-access layer | Yes — it translates low-level database exceptions into Spring's clean \`DataAccessException\` hierarchy |
| **@Controller** | Web layer (Spring MVC) | Yes — it lets the class handle web requests via \`@RequestMapping\`/\`@GetMapping\` etc. |

**Example in Action**

\`\`\`java
@Service                       // business rules live here
public class OrderService {
    // e.g. validate the order, calculate totals, call the repository
}

@Repository                    // database access lives here
public class OrderRepository {
    // JDBC/JPA exceptions thrown here are auto-translated
    // into Spring's DataAccessException — easier to handle
}
\`\`\`

**Best practice:** always pick the *most specific* annotation that fits. \`@Service\` on a service and \`@Repository\` on a repository makes the code self-documenting and lets Spring add layer-specific features for you.`,
        difficulty: "easy",
        tags: ["annotations", "stereotype", "component-scan"]
      },
      {
        id: "ae-3",
        question: "What does @Autowired do, and where can it be applied?",
        answer: `\`@Autowired\` is how you ask Spring to **hand you a bean it already created**, instead of building the object yourself with \`new\`. This is the heart of *dependency injection*: your class just declares what it needs, and Spring "wires" the right object in.

Behind the scenes, when Spring builds your bean it looks at the type you asked for (say \`PaymentService\`), finds a matching bean in its container, and plugs it in automatically.

You can place \`@Autowired\` in three spots:

| Where | Notes |
|---|---|
| **Constructor** (recommended) | Dependencies are explicit, the field can be \`final\` (immutable), and the class is easy to test. |
| **Setter method** | Useful for optional dependencies that can change after construction. |
| **Field** (least preferred) | Shortest to write, but hard to unit-test and hides dependencies. |

**Example in Action**

\`\`\`java
@Service
public class OrderService {
    private final PaymentService paymentService;

    // Constructor injection (recommended).
    // @Autowired is even OPTIONAL when there's only one constructor.
    @Autowired
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
\`\`\`

**Good to know:** by default \`@Autowired\` is *required* — if Spring can't find a matching bean, the whole application fails to start (this is a helpful early warning, not a bug). To make a dependency optional, use \`@Autowired(required = false)\`.`,
        difficulty: "easy",
        tags: ["annotations", "dependency-injection", "autowired"]
      },
      {
        id: "ae-4",
        question: "What is @Value used for?",
        answer: `\`@Value\` lets you **pull configuration values into your code** — things like settings from \`application.properties\`, environment variables, or small computed expressions — without hard-coding them. This keeps values like URLs, timeouts, and feature flags outside your Java code, so you can change them per environment without recompiling.

**Example in Action**

\`\`\`java
@Component
public class AppConfig {

    // Read the value of "app.name" from application.properties/yml
    @Value("\${app.name}")
    private String appName;

    // Same, but fall back to 30 if the property is missing.
    // The part after ':' is the DEFAULT value.
    @Value("\${app.timeout:30}")
    private int timeout;

    // A SpEL (Spring Expression Language) expression — evaluated at startup.
    @Value("#{2 * 3}")
    private int computed;   // = 6
}
\`\`\`

**How to read the syntax:**
- \`\${...}\` means "look this up in the configuration" (property placeholder).
- \`#{...}\` means "evaluate this as a small expression" (SpEL).
- \`\${key:default}\` provides a default so the app still starts if the property is absent.

**When to use it:** \`@Value\` is perfect for a handful of simple, individual settings. If you have many related settings (like a whole block of mail or database config), prefer \`@ConfigurationProperties\`, which binds them into one typed object.`,
        difficulty: "easy",
        tags: ["annotations", "configuration", "properties"]
      },
      {
        id: "ae-5",
        question: "How does @RestController differ from @Controller?",
        answer: `Both mark a class that handles incoming web requests. The difference is **what the methods return by default**:

- **@Controller** is the classic MVC controller. Its methods usually return a *view name* — the name of an HTML template (Thymeleaf/JSP) that Spring should render and send back. If you want a method to return raw data (like JSON) instead, you must add \`@ResponseBody\` to it.
- **@RestController** is a shortcut for building REST APIs. It equals \`@Controller\` + \`@ResponseBody\` applied to *every* method. So whatever you return is written straight into the HTTP response body and serialized to JSON/XML automatically.

A simple way to remember it: use \`@Controller\` when you serve **web pages**, and \`@RestController\` when you serve **data (JSON) to a frontend or another service**.

**Example in Action**

\`\`\`java
// @Controller — returns view names; needs @ResponseBody for raw data
@Controller
public class PageController {

    @GetMapping("/home")
    public String home(Model model) {
        return "home";           // renders home.html template
    }

    @GetMapping("/api/data")
    @ResponseBody                // WITHOUT this, "Data" would be treated as a view name
    public Data getData() {
        return new Data();
    }
}

// @RestController — @ResponseBody is implicit on every method
@RestController
public class ApiController {

    @GetMapping("/api/data")
    public Data getData() {
        return new Data();       // automatically serialized to JSON
    }
}
\`\`\``,
        difficulty: "easy",
        tags: ["annotations", "web", "rest", "mvc"]
      },
      {
        id: "ae-6",
        question: "What is @RequestMapping and what are its shortcut variants?",
        answer: `\`@RequestMapping\` is the annotation that **connects a URL (and HTTP method) to a Java method**. When a request comes in, Spring uses these mappings to decide which method should handle it. You can put it on a class (a common URL prefix for all its methods) and on individual methods (the specific path + HTTP verb).

Because writing \`@RequestMapping(method = RequestMethod.GET)\` everywhere is verbose, Spring 4.3 added shorter, HTTP-verb-specific variants. These are what you'll use 99% of the time:

| Shortcut | Equivalent to | Typical use |
|---|---|---|
| **@GetMapping** | @RequestMapping(method = GET) | Read/fetch data |
| **@PostMapping** | @RequestMapping(method = POST) | Create a new resource |
| **@PutMapping** | @RequestMapping(method = PUT) | Replace/update a resource |
| **@DeleteMapping** | @RequestMapping(method = DELETE) | Delete a resource |
| **@PatchMapping** | @RequestMapping(method = PATCH) | Partially update a resource |

**Example in Action**

\`\`\`java
@RestController
@RequestMapping("/api/orders")   // shared prefix for every method below
public class OrderController {

    @GetMapping("/{id}")                     // GET  /api/orders/42
    public Order getOrder(@PathVariable Long id) { ... }

    @PostMapping                             // POST /api/orders
    public Order createOrder(@RequestBody Order order) { ... }

    @DeleteMapping("/{id}")                  // DELETE /api/orders/42
    public void deleteOrder(@PathVariable Long id) { ... }
}
\`\`\`

Besides \`path\` and \`method\`, \`@RequestMapping\` can also match on \`params\`, \`headers\`, and content types via \`consumes\`/\`produces\` when you need finer control.`,
        difficulty: "easy",
        tags: ["annotations", "web", "mvc", "routing"]
      },
      {
        id: "ae-7",
        question: "What does @PathVariable do?",
        answer: `\`@PathVariable\` **reads a value out of the URL path itself** and gives it to your method as a parameter. It is used when the value is part of the address, like an ID inside \`/users/42\`.

In the URL pattern you write a placeholder in curly braces (e.g. \`{userId}\`), and \`@PathVariable\` captures whatever the caller put there.

**Example in Action**

\`\`\`java
// Request: GET /users/7/orders/1001
@GetMapping("/users/{userId}/orders/{orderId}")
public Order getOrder(
        @PathVariable Long userId,               // captures 7
        @PathVariable("orderId") Long id) {      // captures 1001
    return orderService.find(userId, id);
}
\`\`\`

**Two things worth knowing:**
- The placeholder name must match the parameter name. If they differ, name it explicitly: \`@PathVariable("orderId") Long id\`.
- Spring **converts the type for you** — the text \`"7"\` in the URL becomes a \`Long\`, a \`UUID\`, an \`enum\`, etc. If conversion fails (e.g. \`abc\` where a number is expected), Spring returns a 400 Bad Request automatically.

**@PathVariable vs @RequestParam:** \`@PathVariable\` reads segments of the path (\`/orders/42\`), while \`@RequestParam\` reads query-string values after the \`?\` (\`/orders?status=paid\`).`,
        difficulty: "easy",
        tags: ["annotations", "web", "rest"]
      },
      {
        id: "ae-8",
        question: "What is @RequestParam and how does it differ from @PathVariable?",
        answer: `\`@RequestParam\` **reads values from the query string** — the part of a URL after the \`?\`, written as \`key=value\` pairs. \`@PathVariable\`, by contrast, reads values that are baked into the *path* of the URL.

A quick way to tell them apart:

| | @RequestParam | @PathVariable |
|---|---|---|
| Reads from | Query string after \`?\` | The URL path itself |
| Example URL | \`/products?category=books&page=2\` | \`/products/42\` |
| Good for | Filters, sorting, pagination, optional inputs | Identifying a specific resource |

**Example in Action**

\`\`\`java
// URL: /products?category=electronics&page=2
@GetMapping("/products")
public List<Product> list(
        @RequestParam String category,                 // "electronics"
        @RequestParam(defaultValue = "0") int page) {  // 2 (or 0 if omitted)
    return productService.findByCategory(category, page);
}

// URL: /products/42
@GetMapping("/products/{id}")
public Product get(@PathVariable Long id) {            // 42
    return productService.findById(id);
}
\`\`\`

**Handy @RequestParam options:**
- \`required\` (default \`true\`) — set to \`false\` to make the parameter optional.
- \`defaultValue\` — a fallback value (setting it also makes the param optional).
- \`name\` — use when the query key differs from your Java parameter name.`,
        difficulty: "easy",
        tags: ["annotations", "web", "query-params"]
      },
      {
        id: "ae-9",
        question: "What does @Bean do and how is it different from @Component?",
        answer: `Both \`@Bean\` and \`@Component\` end up doing the same job — registering an object in Spring's container so it can be injected elsewhere. The difference is **who creates the object and where you declare it**:

- **@Component** goes *on a class you own*. Spring finds it during component scanning and builds it for you with its default constructor + \`@Autowired\` dependencies.
- **@Bean** goes *on a method inside a @Configuration class*. You write the code that constructs and returns the object. Spring calls your method and keeps the returned object as a bean.

| | @Component | @Bean |
|---|---|---|
| Placed on | A class | A method (inside @Configuration) |
| Who builds the object | Spring | You (in the method body) |
| Best when | You own the source code | It's a third-party class, or construction needs custom setup logic |

**Example in Action**

\`\`\`java
// @Component — your own class, Spring instantiates it
@Component
public class EmailService { ... }

// @Bean — a third-party class you can't annotate,
//         and which needs some configuration
@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper om = new ObjectMapper();          // library class
        om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return om;                                     // this instance becomes a bean
    }
}
\`\`\`

**Rule of thumb:** annotate your *own* classes with \`@Component\` (or \`@Service\`/\`@Repository\`); use \`@Bean\` to register objects from libraries or when you need construction logic.`,
        difficulty: "easy",
        tags: ["annotations", "beans", "configuration"]
      },
      {
        id: "ae-10",
        question: "What is @Configuration?",
        answer: `\`@Configuration\` marks a class as a **place where you define beans** using \`@Bean\` methods. Think of it as Spring's replacement for the old XML configuration files — a Java class whose job is to describe how to build parts of your application.

What makes \`@Configuration\` special (and different from a plain class) is that Spring wraps it in a proxy using a library called CGLIB. This proxy guarantees **singleton semantics**: even if one \`@Bean\` method calls another, you still get the *same* shared instance rather than a brand-new object each time.

**Example in Action**

\`\`\`java
@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:h2:mem:testdb")
            .build();
    }

    @Bean
    public JdbcTemplate jdbcTemplate() {
        // Because this class is @Configuration, calling dataSource()
        // here returns the SAME DataSource bean created above —
        // not a second, separate instance.
        return new JdbcTemplate(dataSource());
    }
}
\`\`\`

**Why this matters (common subtle bug):** if you used \`@Component\` instead of \`@Configuration\`, that CGLIB proxy would not be applied, so each call to \`dataSource()\` would build a *new* \`DataSource\`. You'd unknowingly end up with multiple connection pools. Use \`@Configuration\` for classes that define beans.`,
        difficulty: "easy",
        tags: ["annotations", "configuration", "beans"]
      }
    ]
  },

  {
    id: "annotations-medium",
    title: "Spring Boot Annotations — Medium",
    icon: "⚙️",
    questions: [
      {
        id: "am-1",
        question: "How does @Conditional and its variants work?",
        answer: `\`@Conditional\` lets you say **"only create this bean if some condition is true."** Spring checks the condition at startup and either registers the bean or skips it. This is exactly how Spring Boot's auto-configuration decides what to set up based on what's on your classpath.

You rarely write raw \`@Conditional\` yourself. Spring Boot ships ready-made variants that cover the common cases:

| Annotation | Registers the bean only when… | Typical use |
|---|---|---|
| **@ConditionalOnProperty** | A property has a given value | Turn a feature on/off via config |
| **@ConditionalOnClass** | A class is present on the classpath | "If library X is available, configure it" |
| **@ConditionalOnMissingBean** | No bean of that type exists yet | Provide a default the user can override |
| **@ConditionalOnBean** | A specific bean already exists | Add-ons that build on another bean |
| **@ConditionalOnWebApplication** | The app is a web app | Register web-only beans |

**Example in Action**

\`\`\`java
@Configuration
public class CacheConfig {

    // Created ONLY if application.properties has: cache.enabled=true
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }

    // Created ONLY if the user hasn't defined their own CacheManager —
    // this is the "safe default" pattern.
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager noOpCacheManager() {
        return new NoOpCacheManager();
    }
}
\`\`\`

**Why it matters:** \`@ConditionalOnMissingBean\` in particular is the backbone of Spring Boot's "sensible defaults you can always override" philosophy — Boot provides a bean only if you didn't provide one yourself.`,
        difficulty: "medium",
        tags: ["annotations", "conditional", "auto-configuration"]
      },
      {
        id: "am-2",
        question: "What is @Transactional and what are its propagation levels?",
        answer: `In Spring, \`@Transactional\` is used to manage database transactions **declaratively** — you just add the annotation, and Spring handles the begin/commit/rollback for you. It ensures that a group of database operations run as a single, all-or-nothing unit of work.

If every operation in the method succeeds, the transaction is **committed** (saved permanently). If any operation fails by throwing a runtime exception, the whole transaction is **rolled back**, leaving the database exactly as it was before. This is what protects data integrity (the "A" for Atomicity in ACID).

**How it works behind the scenes:** Spring wraps your bean in a proxy. When you call a \`@Transactional\` method from outside, the proxy intercepts the call, opens a database connection, starts the transaction, runs your method, and then either commits or rolls back based on the outcome.

**Key attributes you can set:**
- \`propagation\` — how this method behaves if a transaction is already running (see below)
- \`isolation\` — how isolated this transaction is from others running at the same time
- \`rollbackFor\` — which exception types trigger a rollback (by default only *unchecked* exceptions do)
- \`readOnly\` — a hint that lets the provider optimize read-only work

**Propagation levels**

Propagation defines what happens when a \`@Transactional\` method is called by another method that may or may not already be inside a transaction. Spring offers 7 behaviors, configured like \`@Transactional(propagation = Propagation.REQUIRED)\`.

| Propagation | Behavior | Common use case |
|---|---|---|
| **REQUIRED** (default) | Join the existing transaction; create a new one if none exists. | The normal choice for most business logic. |
| **REQUIRES_NEW** | Always start a new transaction, suspending any existing one until it finishes. | Audit logs or notifications that must be saved even if the main work fails. |
| **SUPPORTS** | Join a transaction if one exists; otherwise run without one. | Reads that can participate in a transaction but don't require it. |
| **NOT_SUPPORTED** | Always run without a transaction, suspending any existing one. | Long external calls that shouldn't hold DB locks. |
| **MANDATORY** | Must run inside an existing transaction, else throw an exception. | Helper methods that only make sense mid-transaction. |
| **NEVER** | Must run *without* a transaction, else throw an exception. | Code that must never touch a transactional context. |
| **NESTED** | Run inside a nested transaction using a savepoint; on failure roll back only to the savepoint, not the whole outer transaction. | Batch processing where one bad item shouldn't undo the rest. |

**Example in Action**

\`\`\`java
@Service
public class OrderService {

    // Defaults to Propagation.REQUIRED
    @Transactional(rollbackFor = Exception.class)
    public void placeOrder(Order order) {
        orderRepo.save(order);
        // If charging fails, the saved order is rolled back too.
        paymentService.charge(order);
    }

    // Runs in its OWN transaction — committed even if the caller rolls back.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAudit(String event) {
        auditRepo.save(new AuditLog(event));
    }
}
\`\`\`

**Common gotcha:** \`@Transactional\` only works when the method is called **through the Spring proxy** (i.e. from outside the bean). If a method inside the same class calls another \`@Transactional\` method directly (self-invocation), the proxy is bypassed and no transaction starts.`,
        difficulty: "medium",
        tags: ["annotations", "transactions", "database"]
      },
      {
        id: "am-3",
        question: "Explain @Scope and the available bean scopes in Spring.",
        answer: `\`@Scope\` controls **how many instances of a bean Spring creates and how long each one lives**. By default Spring makes exactly one shared instance of each bean (a *singleton*), but sometimes you want a fresh instance per request, per user session, and so on.

| Scope | How many / how long |
|---|---|
| **singleton** (default) | One shared instance for the whole application. |
| **prototype** | A brand-new instance every time the bean is requested/injected. |
| **request** | One instance per HTTP request (web apps only). |
| **session** | One instance per user's HTTP session. |
| **application** | One instance per ServletContext. |
| **websocket** | One instance per WebSocket session. |

**Example in Action**

\`\`\`java
@Component
@Scope("prototype")
public class ReportGenerator {
    // A new object is created each time this bean is needed
}

// Getting a fresh prototype from inside a singleton:
@Component
public class ReportService {

    @Autowired
    private ApplicationContext ctx;

    public void generate() {
        // Ask the container for a fresh instance each time
        ReportGenerator gen = ctx.getBean(ReportGenerator.class);
    }
}
\`\`\`

**The tricky part — injecting a short-lived bean into a singleton:** a singleton is created once at startup, so if you inject a \`request\`-scoped bean into it directly, it would capture only the *first* request's instance. The fix is a **scoped proxy**: Spring injects a smart proxy that, on each call, routes to the correct current instance.

\`\`\`java
@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext { ... }
\`\`\`

**Note:** for \`prototype\` beans, Spring creates the instance but does *not* manage its full lifecycle — destruction callbacks like \`@PreDestroy\` are not called.`,
        difficulty: "medium",
        tags: ["annotations", "beans", "scope"]
      },
      {
        id: "am-4",
        question: "What is @Profile and how do you activate profiles?",
        answer: `\`@Profile\` lets you **turn beans on or off depending on the environment** (dev, test, prod, etc.). A bean marked with a profile is only created when that profile is *active*. This is how you keep, say, an in-memory database for local development but a real connection pool in production — without changing code.

**Example in Action**

\`\`\`java
@Configuration
@Profile("dev")                     // only active when 'dev' profile is on
public class DevDataSourceConfig {
    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2).build();   // lightweight in-memory DB
    }
}

@Configuration
@Profile("prod")                    // only active when 'prod' profile is on
public class ProdDataSourceConfig {
    @Bean
    public DataSource dataSource() {
        // real production connection pool
    }
}
\`\`\`

**How to activate a profile (pick one):**
1. In \`application.properties\`: \`spring.profiles.active=dev\`
2. As an environment variable: \`SPRING_PROFILES_ACTIVE=prod\`
3. As a JVM argument: \`-Dspring.profiles.active=prod\`
4. Programmatically: \`SpringApplication.setAdditionalProfiles("dev")\`

**Handy syntax:**
- \`@Profile("!prod")\` — active in every profile *except* prod (negation).
- \`@Profile({"dev", "test"})\` — active when *either* dev or test is on.`,
        difficulty: "medium",
        tags: ["annotations", "profiles", "configuration"]
      },
      {
        id: "am-5",
        question: "How does @Async work and what are its requirements?",
        answer: `\`@Async\` lets a method **run in the background on a separate thread**, so the caller doesn't have to wait for it to finish. You call the method, it returns immediately, and the work continues elsewhere. This is great for things like sending emails or calling slow external services without blocking the user's request.

**How it works behind the scenes:** just like \`@Transactional\`, Spring wraps the bean in a proxy. When you call the \`@Async\` method, the proxy hands the work to a thread pool (a \`TaskExecutor\`) and returns control to you right away.

**Requirements (all must be true, or it silently runs synchronously):**
1. Enable it with \`@EnableAsync\` on a \`@Configuration\` class.
2. The \`@Async\` method must be \`public\`.
3. It must be called from *outside* the bean (proxy limitation — same as \`@Transactional\`).

**Example in Action**

\`\`\`java
@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        exec.setCorePoolSize(4);            // baseline threads
        exec.setMaxPoolSize(10);            // grow up to this under load
        exec.setQueueCapacity(100);         // tasks waiting for a thread
        exec.setThreadNamePrefix("async-");
        exec.initialize();
        return exec;
    }
}

@Service
public class EmailService {

    @Async                                   // runs on the pool above
    public CompletableFuture<Void> sendWelcomeEmail(String to) {
        mailer.send(to, "Welcome!");         // slow work, off the main thread
        return CompletableFuture.completedFuture(null);
    }
}
\`\`\`

**Return types you can use:** \`void\` (fire-and-forget), or \`Future<T>\` / \`CompletableFuture<T>\` / \`ListenableFuture<T>\` when you need the result later.`,
        difficulty: "medium",
        tags: ["annotations", "async", "threading"]
      },
      {
        id: "am-6",
        question: "What is @EventListener and how does Spring's event system work?",
        answer: `Spring has a built-in **publish/subscribe (pub-sub) system**: one part of your code can *publish* an event, and other parts can *listen* for it — without the two knowing about each other directly. This is a clean way to decouple side-effects (like "send a confirmation email") from core logic (like "save the order").

There are two pieces: you publish with \`ApplicationEventPublisher\`, and you subscribe with \`@EventListener\`.

**Example in Action**

\`\`\`java
// 1. Define an event — any plain object works
public record OrderPlacedEvent(Long orderId) {}

// 2. Publish it after the core work is done
@Service
public class OrderService {
    private final ApplicationEventPublisher publisher;

    public void placeOrder(Order order) {
        orderRepo.save(order);
        publisher.publishEvent(new OrderPlacedEvent(order.getId()));
    }
}

// 3. React to it — as many listeners as you like
@Component
public class InventoryListener {

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        inventoryService.reserveItems(event.orderId());
    }

    // Run asynchronously, and only if a condition holds (SpEL)
    @Async
    @EventListener(condition = "#event.orderId > 0")
    public void sendConfirmation(OrderPlacedEvent event) {
        emailService.send(event.orderId());
    }
}
\`\`\`

**Key point:** by default, event listeners run **synchronously** — the publisher waits for every listener to finish. Add \`@Async\` (with \`@EnableAsync\`) when you want a listener to run in the background so it doesn't slow the publisher down.`,
        difficulty: "medium",
        tags: ["annotations", "events", "pub-sub"]
      },
      {
        id: "am-7",
        question: "Explain @Cacheable, @CachePut, and @CacheEvict.",
        answer: `These annotations add **caching** to a method with almost no code — you store expensive results (like a database lookup) and reuse them instead of recomputing. To use any of them you first enable caching with \`@EnableCaching\` on a configuration class.

Each annotation plays a different role:

| Annotation | What it does | Use it for |
|---|---|---|
| **@Cacheable** | If the result is already cached, return it *without* running the method; otherwise run the method and cache the result. | Read methods (e.g. \`findById\`) |
| **@CachePut** | *Always* runs the method, then updates the cache with the new result. | Update methods — keep the cache fresh |
| **@CacheEvict** | Removes one entry (or all entries) from the cache. | Delete methods — drop stale data |

**Example in Action**

\`\`\`java
@Service
public class ProductService {

    // First call hits the DB and caches; later calls with the same id skip the DB
    @Cacheable(value = "products", key = "#id")
    public Product findById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    // Runs the save AND refreshes the cached copy
    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) {
        return repo.save(product);
    }

    // Removes just this product from the cache
    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // Clears the entire "products" cache at once
    @CacheEvict(value = "products", allEntries = true)
    public void clearAll() {}
}
\`\`\`

**Good to know:** the cache backend is pluggable. Out of the box it's a simple in-memory \`ConcurrentHashMap\`, but you can swap in Redis, Caffeine, EhCache, etc. without changing these annotations.`,
        difficulty: "medium",
        tags: ["annotations", "caching", "performance"]
      },
      {
        id: "am-8",
        question: "What is @ControllerAdvice and @ExceptionHandler?",
        answer: `Together these let you handle errors **in one central place** instead of repeating \`try/catch\` in every controller.

- **@ExceptionHandler** marks a method as the handler for a specific exception type. When that exception is thrown while handling a request, Spring calls this method instead of letting the error bubble out as an ugly stack trace.
- **@ControllerAdvice** is a special \`@Component\` whose \`@ExceptionHandler\` methods apply to **all controllers globally** — so you write your error handling once for the whole app.

**Example in Action**

\`\`\`java
@RestControllerAdvice   // = @ControllerAdvice + @ResponseBody (returns JSON)
public class GlobalExceptionHandler {

    // Handle "not found" anywhere → 404 with a clean JSON body
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    // Handle validation failures → 400 with the list of field errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream().map(FieldError::getDefaultMessage).toList();
        return new ErrorResponse("VALIDATION_FAILED", errors.toString());
    }

    // Catch-all safety net → 500, without leaking internal details
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleAll(Exception ex) {
        return new ErrorResponse("INTERNAL_ERROR", "Unexpected error occurred");
    }
}
\`\`\`

**Scoping tip:** you can limit a \`@ControllerAdvice\` to certain controllers using \`basePackages\` or \`assignableTypes\`, instead of applying it to every controller in the app.`,
        difficulty: "medium",
        tags: ["annotations", "exception-handling", "web"]
      },
      {
        id: "am-9",
        question: "What is the difference between @Validated and @Valid?",
        answer: `Both trigger **Bean Validation** — the mechanism that checks constraints like \`@NotNull\`, \`@Email\`, or \`@Size\` on your objects. They look almost identical, and for basic cases you can use either. The key difference is that \`@Validated\` is Spring's own annotation and adds a feature called **validation groups**.

| | @Valid | @Validated |
|---|---|---|
| Comes from | The Jakarta (Java) Validation API | The Spring framework |
| Cascades into nested objects | Yes | Yes |
| Supports validation **groups** | No | Yes |
| Can be placed on a class | No | Yes (enables method-level validation via AOP) |

**What are validation groups?** They let you apply *different* rules in different situations — for example, an \`id\` must be null when creating a record but present when updating it.

**Example in Action**

\`\`\`java
// @Valid — standard validation of a request body in a controller
@PostMapping("/users")
public ResponseEntity<User> create(@Valid @RequestBody UserDto dto) { ... }

// @Validated with GROUPS — apply different rules per operation
public interface OnCreate {}
public interface OnUpdate {}

public class UserDto {
    @Null(groups = OnCreate.class)      // must be null when creating
    @NotNull(groups = OnUpdate.class)   // must be present when updating
    private Long id;

    @NotBlank
    private String name;                // always required
}

@Service
@Validated                              // enables method-level validation
public class UserService {
    public void create(@Validated(OnCreate.class) UserDto dto) { ... }
    public void update(@Validated(OnUpdate.class) UserDto dto) { ... }
}
\`\`\`

**Rule of thumb:** use \`@Valid\` for ordinary request-body validation; reach for \`@Validated\` when you need groups or class-level (method) validation.`,
        difficulty: "medium",
        tags: ["annotations", "validation", "bean-validation"]
      },
      {
        id: "am-10",
        question: "How does @Scheduled work and what are its options?",
        answer: `\`@Scheduled\` lets you **run a method automatically on a timer** — every few seconds, or at a fixed time each day — without writing any thread or timer code yourself. It's how you build background jobs like polling, cleanup tasks, or daily reports. To turn it on, add \`@EnableScheduling\` to a configuration class.

You choose *when* it runs with one of these options:

| Option | Meaning |
|---|---|
| **fixedRate** | Start the method every N milliseconds, measured from each *start* (runs on a steady beat). |
| **fixedDelay** | Wait N milliseconds *after the previous run finishes* before starting again. |
| **cron** | Use a cron expression for calendar-style schedules (e.g. "9 AM daily"). |
| **initialDelay** | Wait this long before the very first run. |

**Example in Action**

\`\`\`java
@Component
public class ReportScheduler {

    // Every 5 seconds, regardless of how long each run takes
    @Scheduled(fixedRate = 5000)
    public void pollMetrics() { ... }

    // 5 seconds AFTER the previous run finishes
    @Scheduled(fixedDelay = 5000)
    public void processQueue() { ... }

    // Every day at 9:00:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReport() { ... }

    // Wait 10s at startup, then run every 60s
    @Scheduled(fixedRate = 60000, initialDelay = 10000)
    public void warmupTask() { ... }
}
\`\`\`

**Cron format:** \`second minute hour day-of-month month day-of-week\`.

**Watch out:** by default all scheduled tasks share a *single* thread, so a long-running job can delay the others. Define a \`TaskScheduler\` bean with a thread pool if you need them to run in parallel.`,
        difficulty: "medium",
        tags: ["annotations", "scheduling", "cron"]
      }
    ]
  },

  {
    id: "annotations-hard",
    title: "Spring Boot Annotations — Hard",
    icon: "🔥",
    questions: [
      {
        id: "ah-1",
        question: "How does Spring Boot auto-configuration actually work internally?",
        answer: `Auto-configuration is the "magic" that makes Spring Boot set things up for you: add \`spring-boot-starter-web\` and suddenly you have a running web server, no config needed. Under the hood there's no magic — it's a well-defined mechanism built on conditional beans and a list of configuration classes that Boot loads at startup.

**Step-by-step, what happens when the app starts:**

1. \`@SpringBootApplication\` includes \`@EnableAutoConfiguration\`.
2. \`@EnableAutoConfiguration\` imports a special class, \`AutoConfigurationImportSelector\`.
3. That selector reads a file on the classpath — \`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\` (Spring Boot 3+; older versions used \`spring.factories\`). This file lists dozens of auto-configuration class names.
4. Each listed class is annotated with \`@AutoConfiguration\` (basically \`@Configuration\` plus ordering hints) and guarded by conditions like \`@ConditionalOnClass\`.
5. Only the classes whose conditions *pass* actually register their beans. Everything else is quietly skipped.

**Example — what a real auto-configuration looks like internally:**

\`\`\`java
@AutoConfiguration(after = DataSourceAutoConfiguration.class)
@ConditionalOnClass({ DataSource.class, JdbcTemplate.class })   // only if these are present
@ConditionalOnSingleCandidate(DataSource.class)                // only if exactly one DataSource
@EnableConfigurationProperties(JdbcProperties.class)
public class JdbcTemplateAutoConfiguration {

    @Bean
    @Primary
    @ConditionalOnMissingBean(JdbcOperations.class)            // don't override the user's own
    JdbcTemplate jdbcTemplate(DataSource ds, JdbcProperties props) {
        JdbcTemplate tmpl = new JdbcTemplate(ds);
        tmpl.setFetchSize(props.getTemplate().getFetchSize());
        return tmpl;
    }
}
\`\`\`

Notice the pattern: **"configure this only if the right classes are on the classpath AND the user hasn't already provided their own bean."** That's why Boot's defaults never fight your custom configuration.

**Debugging tip:** run the app with \`--debug\` to get the *auto-configuration report* — it lists which configurations matched (positive matches), which didn't (negative matches), and why.`,
        difficulty: "hard",
        tags: ["auto-configuration", "internals", "spring-boot"]
      },
      {
        id: "ah-2",
        question: "Explain Spring AOP, proxy types, and how @Transactional's proxy limitation works.",
        answer: `**AOP (Aspect-Oriented Programming)** is how Spring adds behavior "around" your methods — things like starting a transaction, logging, or security — *without* you writing that code in every method. Spring does this by wrapping your bean in a **proxy**: a stand-in object that looks like your bean but runs extra logic (called *advice*) before/after delegating to the real object.

\`\`\`
Client → [Spring proxy]  → [Your real bean]
                ↑ advice (e.g. begin/commit transaction) runs here
\`\`\`

**Two kinds of proxy Spring can create:**

| Proxy type | Used when | How it works |
|---|---|---|
| **JDK dynamic proxy** | Your bean implements an interface | Creates a new object implementing the same interface |
| **CGLIB proxy** | No interface (or \`proxyTargetClass=true\`) | Creates a runtime subclass of your bean's class |

**The self-invocation problem (why this matters for @Transactional):**

Because the advice lives in the *proxy*, it only runs when the call comes **through the proxy** — i.e. from *outside* the bean. If one method in a bean calls another method of the *same* bean directly, that call goes straight to the real object and bypasses the proxy entirely.

\`\`\`java
@Service
public class OrderService {

    @Transactional
    public void placeOrder() {
        // 'this.' calls the REAL object, not the proxy →
        // sendConfirmation() does NOT get its own transaction!
        this.sendConfirmation();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendConfirmation() { ... }
}
\`\`\`

**Ways to fix it:**
1. Move \`sendConfirmation\` into a *separate* bean and inject it (cleanest).
2. Inject the bean into itself: \`@Autowired private OrderService self;\` then call \`self.sendConfirmation()\` (goes through the proxy).
3. Use \`AopContext.currentProxy()\` (requires \`exposeProxy = true\`).

**Full solution:** **AspectJ** weaving (compile-time or load-time) modifies the actual bytecode instead of using proxies, so even self-invocation is intercepted — it's the only approach that fully removes this limitation.`,
        difficulty: "hard",
        tags: ["aop", "proxy", "transactions", "internals"]
      },
      {
        id: "ah-3",
        question: "What are @Import, @ImportResource, and @ImportAutoConfiguration, and when do you need each?",
        answer: `All three bring *extra configuration* into your Spring context, but each solves a different problem. Here's the quick map before the details:

| Annotation | Brings in | Use when |
|---|---|---|
| **@Import** | Java \`@Configuration\` classes (or selectors) | Splitting config into modules |
| **@ImportResource** | Old XML bean-definition files | Integrating with legacy XML |
| **@ImportAutoConfiguration** | Specific auto-configurations, explicitly | Tests and libraries that want precise control |

**@Import** — pulls in one or more \`@Configuration\` classes so their beans join your context. It can also take an \`ImportSelector\` when you need to decide *programmatically* what to import.

\`\`\`java
@Configuration
@Import({ SecurityConfig.class, CacheConfig.class })   // compose modular config
public class AppConfig { }

// Programmatic import: pick classes at runtime
public class MySelector implements ImportSelector {
    @Override
    public String[] selectImports(AnnotationMetadata meta) {
        return new String[]{ "com.example.BeanA", "com.example.BeanB" };
    }
}
\`\`\`

**@ImportResource** — loads beans defined in an old-style XML file. You only need this when interoperating with legacy configuration.

\`\`\`java
@Configuration
@ImportResource("classpath:legacy-beans.xml")
public class LegacyConfig { }
\`\`\`

**@ImportAutoConfiguration** — loads *specific* auto-configuration classes without triggering Spring Boot's full auto-config scan. This is mainly used inside test "slices" (like \`@DataJpaTest\`) so a test loads only the pieces it needs — keeping tests fast and focused.

**Rule of thumb:** use \`@Import\` for everyday modular configuration; avoid \`@ImportResource\` unless you're stuck with legacy XML; use \`@ImportAutoConfiguration\` when writing test slices or your own starter.`,
        difficulty: "hard",
        tags: ["annotations", "configuration", "import", "testing"]
      },
      {
        id: "ah-4",
        question: "How do you write a custom Spring Boot starter?",
        answer: `A **custom starter** is a reusable module you can drop into any project to instantly add some capability — the same way \`spring-boot-starter-web\` adds web support. When it's on the classpath, its beans auto-configure themselves. By convention you name it \`something-spring-boot-starter\`.

**The steps:**

**1. Create an auto-configuration class** that defines your beans, guarded by conditions so it only activates when appropriate:

\`\`\`java
@AutoConfiguration
@ConditionalOnClass(AcmeClient.class)                     // only if the library is present
@EnableConfigurationProperties(AcmeProperties.class)      // bind config into a typed object
public class AcmeAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean                             // let the user override it
    public AcmeClient acmeClient(AcmeProperties props) {
        return new AcmeClient(props.getApiKey(), props.getBaseUrl());
    }
}
\`\`\`

**2. Register it** so Spring Boot knows to load it. Create the file
\`src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports\`
and put the fully-qualified class name inside:

\`\`\`
com.acme.AcmeAutoConfiguration
\`\`\`

**3. Define typed configuration** with \`@ConfigurationProperties\` so users configure it via \`application.properties\`:

\`\`\`java
@ConfigurationProperties(prefix = "acme")
public class AcmeProperties {
    private String apiKey;
    private String baseUrl = "https://api.acme.com";   // sensible default
    // getters/setters
}
\`\`\`

**4. Create the thin "starter" module** — a tiny module with no code that just declares dependencies on your auto-configure module plus the underlying library. This is what users actually add to their build.

**5. (Optional) Generate metadata** by adding \`spring-boot-configuration-processor\`, which gives users IDE auto-complete and docs for your properties.`,
        difficulty: "hard",
        tags: ["starter", "auto-configuration", "library", "advanced"]
      },
      {
        id: "ah-5",
        question: "How do bean lifecycle callbacks work? Compare @PostConstruct, InitializingBean, and init-method.",
        answer: `Spring gives beans **hooks to run code right after they're created** (initialization) and **right before they're destroyed** (cleanup). This is where you'd open a connection pool on startup and close it on shutdown. There are three ways to register each hook, and Spring runs them in a fixed order.

**Initialization — runs in this order:**
1. \`@PostConstruct\` method
2. \`InitializingBean.afterPropertiesSet()\`
3. Custom \`init-method\` (from \`@Bean(initMethod = "...")\` or XML)

**Destruction — runs in this order:**
1. \`@PreDestroy\` method
2. \`DisposableBean.destroy()\`
3. Custom \`destroy-method\`

**Example in Action**

\`\`\`java
@Component
public class ConnectionPool implements InitializingBean, DisposableBean {

    @PostConstruct
    public void init() {
        System.out.println("1. @PostConstruct");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("2. InitializingBean.afterPropertiesSet");
    }

    // Would run 3rd if registered via @Bean(initMethod = "customInit")
    public void customInit() {
        System.out.println("3. init-method");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("1. @PreDestroy");
    }

    @Override
    public void destroy() {
        System.out.println("2. DisposableBean.destroy");
    }
}
\`\`\`

**Best practice:** prefer \`@PostConstruct\` / \`@PreDestroy\`. They're standard Java (JSR-250), not tied to Spring interfaces, so your class stays loosely coupled and portable.

**Note:** for \`prototype\`-scoped beans, Spring does *not* call destruction callbacks (\`@PreDestroy\` / \`destroy()\`) — it hands you the object and forgets about it.`,
        difficulty: "hard",
        tags: ["annotations", "lifecycle", "beans", "advanced"]
      },
      {
        id: "ah-6",
        question: "What is @ConfigurationProperties and how does it differ from @Value for externalized configuration?",
        answer: `\`@ConfigurationProperties\` **binds a whole group of related settings into one strongly-typed Java object**. Instead of injecting a dozen individual values with \`@Value\`, you map a section of your config file onto a class — with type safety, validation, and nested structure.

\`@Value\` injects *one* value at a time via a \`\${...}\` expression; \`@ConfigurationProperties\` maps an *entire tree* of properties at once.

**Example in Action**

\`\`\`java
// application.yml:
//   mail:
//     host: smtp.example.com
//     port: 587
//     credentials:
//       username: user
//       password: secret

@ConfigurationProperties(prefix = "mail")   // binds everything under "mail"
@Validated
public class MailProperties {

    @NotBlank
    private String host;

    @Min(1) @Max(65535)
    private int port = 25;

    private Credentials credentials = new Credentials();   // nested object

    public static class Credentials {
        private String username;
        private String password;
        // getters/setters
    }
    // getters/setters
}

// Register it:
@SpringBootApplication
@EnableConfigurationProperties(MailProperties.class)
public class App { }
\`\`\`

**How the two compare:**

| Feature | @Value | @ConfigurationProperties |
|---|---|---|
| Type safety | Manual, per value | Full — nested objects, lists, maps |
| Validation | None | Yes, with \`@Validated\` + JSR-380 |
| IDE auto-complete | Limited | Full (with the metadata processor) |
| Relaxed binding | No | Yes (\`camelCase\` = \`kebab-case\` = \`ENV_VAR\`) |
| Complex/nested types | Painful | Easy |

**Rule of thumb:** use \`@Value\` for a single simple value; use \`@ConfigurationProperties\` for anything with multiple related or nested settings.`,
        difficulty: "hard",
        tags: ["annotations", "configuration", "properties", "best-practices"]
      },
      {
        id: "ah-7",
        question: "How does Spring handle circular dependencies, and what changed in Spring Boot 2.6+?",
        answer: `A **circular dependency** happens when two beans need each other: Bean A requires Bean B to be built, but Bean B requires Bean A — a chicken-and-egg problem. Spring has to decide how (or whether) to untangle it.

**What changed over the versions:**

| Version | Behavior |
|---|---|
| **Before Boot 2.6** | Constructor-based cycles always failed. Field/setter cycles were silently resolved by injecting a partially-built object. |
| **Boot 2.6+** | Circular dependencies are **banned by default** — the app fails to start with a clear error, forcing you to fix the design. |

A typical error looks like:

\`\`\`
The dependencies of some of the beans in the application context form a cycle:
serviceA → serviceB → serviceA
\`\`\`

**How to fix a circular dependency (best first):**

1. **Refactor** — usually the cycle means the two classes are doing too much; extract the shared logic into a third bean that both depend on.
2. **Use @Lazy** on one side so Spring injects a proxy first and resolves the real bean only when it's actually used:

\`\`\`java
@Service
public class ServiceA {
    private final ServiceB serviceB;

    public ServiceA(@Lazy ServiceB serviceB) {   // breaks the startup cycle
        this.serviceB = serviceB;
    }
}
\`\`\`

3. **Use setter injection** for one direction instead of constructor injection.
4. **Re-enable it (discouraged):** \`spring.main.allow-circular-references=true\` — a band-aid, not a fix.

**The real takeaway:** a circular dependency is usually a *design smell* signaling two classes are too tightly coupled. Decoupling them is almost always the right move.`,
        difficulty: "hard",
        tags: ["circular-dependency", "beans", "spring-boot", "advanced"]
      },
      {
        id: "ah-8",
        question: "Explain BeanPostProcessor and BeanFactoryPostProcessor and their use cases.",
        answer: `These are two **extension points** that let you hook into Spring's startup process and customize how beans are built. They run at different stages, which is the key to telling them apart:

- **BeanFactoryPostProcessor** runs *before* any bean is created. At this point beans exist only as *definitions* (metadata/blueprints), so you can modify those blueprints — change a scope, tweak a property, etc.
- **BeanPostProcessor** runs *after* each bean is instantiated and its dependencies are injected, but *before* it's handed to your code. This is the stage where Spring itself wraps beans in AOP proxies.

**BeanFactoryPostProcessor — edit the blueprint before construction:**

\`\`\`java
@Component
public class PropertyOverrider implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory factory) {
        BeanDefinition def = factory.getBeanDefinition("myService");
        def.setScope("prototype");   // change the scope before it's ever built
    }
}
\`\`\`

**BeanPostProcessor — inspect or wrap each finished bean:**

\`\`\`java
@Component
public class TimingPostProcessor implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String name) {
        // runs BEFORE @PostConstruct / afterPropertiesSet
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String name) {
        // this is where Spring creates AOP proxies
        if (bean instanceof Service) {
            return Proxy.newProxyInstance(...);   // wrap it, e.g. to time calls
        }
        return bean;
    }
}
\`\`\`

**Overall order of execution:**
\`BeanDefinitionRegistryPostProcessor\` → \`BeanFactoryPostProcessor\` → bean instantiation → \`BeanPostProcessor.before\` → \`@PostConstruct\` → \`afterPropertiesSet\` → \`BeanPostProcessor.after\`.`,
        difficulty: "hard",
        tags: ["spring-internals", "bean-lifecycle", "extension-points"]
      },
      {
        id: "ah-9",
        question: "What is @Primary vs @Qualifier, and how do you resolve bean ambiguity?",
        answer: `When there are **two or more beans of the same type**, Spring doesn't know which one to inject and fails with \`NoUniqueBeanDefinitionException\`. \`@Primary\` and \`@Qualifier\` are the two ways to break the tie — one sets a *default*, the other picks *explicitly*.

**1. @Primary** — marks one bean as the default winner. It's used whenever no more specific instruction is given.

\`\`\`java
@Bean @Primary
public DataSource primaryDataSource() { return masterDs(); }

@Bean
public DataSource replicaDataSource() { return replicaDs(); }

// No qualifier → gets the @Primary one (primaryDataSource)
@Autowired
private DataSource dataSource;
\`\`\`

**2. @Qualifier** — names exactly which bean you want at a specific injection point. It overrides \`@Primary\`.

\`\`\`java
@Autowired
@Qualifier("replicaDataSource")
private DataSource readDataSource;
\`\`\`

**3. Custom qualifier annotation** — a type-safe alternative to string names (no typos):

\`\`\`java
@Target({FIELD, PARAMETER, METHOD})
@Retention(RUNTIME)
@Qualifier
public @interface Replica {}

@Bean @Replica
public DataSource replicaDataSource() { ... }

@Autowired @Replica
private DataSource readDataSource;   // resolved by the annotation, not a string
\`\`\`

**4. Inject them all** — sometimes you actually want *every* bean of a type:

\`\`\`java
@Autowired
private List<DataSource> allDataSources;             // all of them

@Autowired
private Map<String, DataSource> dataSources;         // key = bean name
\`\`\`

**The distinction:** \`@Primary\` is a *global default* ("use this one unless told otherwise"), while \`@Qualifier\` gives *precise, per-injection control*. Use \`@Primary\` for the common case and \`@Qualifier\` for the exceptions.`,
        difficulty: "hard",
        tags: ["annotations", "beans", "qualifier", "ambiguity"]
      }
    ]
  },

  {
    id: "core-java",
    title: "Core Java Concepts",
    icon: "☕",
    questions: [
      {
        id: "cj-1",
        question: "What is the difference between == and .equals() in Java?",
        answer: `This is one of the most common sources of bugs for new Java developers. The short version:

- **\`==\`** compares **identity** — for objects it asks "are these the *exact same object* in memory?" (same reference). For primitives (\`int\`, \`char\`, …) it compares the actual values.
- **\`.equals()\`** compares **content** — "do these two objects *mean the same thing*?" — as defined by the class. For \`String\`, that means same characters.

**Example in Action**

\`\`\`java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);       // false — two different objects on the heap
System.out.println(a.equals(b));  // true  — same characters inside

// String literals are "interned" — shared from a pool
String x = "hello";
String y = "hello";
System.out.println(x == y);       // true  — both point to the SAME pooled object
\`\`\`

**Rule of thumb:** for objects, almost always use \`.equals()\`. Only use \`==\` on objects when you specifically want to check "is it literally the same instance."

**The equals() contract** (what a correct \`equals\` must satisfy):
- Reflexive: \`a.equals(a)\` is \`true\`.
- Symmetric: \`a.equals(b)\` ⟺ \`b.equals(a)\`.
- Transitive: if \`a.equals(b)\` and \`b.equals(c)\`, then \`a.equals(c)\`.
- Consistent: repeated calls give the same result.
- \`a.equals(null)\` is \`false\`.

**Critical companion rule:** whenever you override \`equals()\`, you **must** also override \`hashCode()\`. If you don't, objects that are "equal" can land in different buckets and break \`HashMap\`/\`HashSet\`.`,
        difficulty: "easy",
        tags: ["core-java", "equality", "strings"]
      },
      {
        id: "cj-2",
        question: "Explain Java's memory model: heap, stack, metaspace, and string pool.",
        answer: `When your program runs, the JVM splits memory into a few regions, each with a specific job. Understanding them explains a lot of Java behavior (like why \`new String("x") == "x"\` is false).

| Region | What it holds | Who uses it |
|---|---|---|
| **Stack** | Local variables + method-call frames | Each thread has its *own* stack |
| **Heap** | All objects (everything created with \`new\`) | Shared by all threads |
| **Metaspace** | Class metadata (bytecode, method info) | The JVM (native memory) |
| **String Pool** | Interned string literals | Lives inside the heap |

**In more detail:**
- **Stack** — small, fast, organized as last-in-first-out. When a method is called a frame is pushed; when it returns the frame pops and its locals vanish automatically.
- **Heap** — the big shared area where objects live. It's cleaned up by the **Garbage Collector**, which reclaims objects nothing points to anymore.
- **Metaspace** (Java 8+, replaced the old "PermGen") — native memory storing information about your classes. It grows as needed.
- **String Pool** — a special spot in the heap where string *literals* are stored once and reused, to save memory.

**Example in Action**

\`\`\`java
// Reference 'name' lives on the STACK.
// The String object lives on the HEAP.
// The literal "Alice" is interned in the POOL.
String name = "Alice";

String s1 = "Alice";                 // reuses the pooled "Alice"
String s2 = "Alice";                 // same pooled object
String s3 = new String("Alice");     // 'new' forces a fresh heap object

System.out.println(s1 == s2);          // true  — same pooled reference
System.out.println(s1 == s3);          // false — different heap object
System.out.println(s1 == s3.intern()); // true  — intern() returns the pooled one
\`\`\`

**Key takeaway:** \`new\` always creates a distinct object, while string literals are shared from the pool — which is why \`==\` gives different answers in the two cases.`,
        difficulty: "medium",
        tags: ["core-java", "jvm", "memory", "garbage-collection"]
      },
      {
        id: "cj-3",
        question: "What is the difference between checked and unchecked exceptions?",
        answer: `Java has two families of exceptions, and the difference is **whether the compiler forces you to deal with them**.

- **Checked exceptions** (extend \`Exception\` but not \`RuntimeException\`) represent problems you can often *recover from* — a missing file, a network timeout. The compiler **forces** you to either \`catch\` them or declare \`throws\`. This is Java saying "you must have a plan for this."
- **Unchecked exceptions** (extend \`RuntimeException\` or \`Error\`) usually represent *programming mistakes* — a null pointer, an illegal argument. The compiler does **not** force you to handle them, because the right fix is usually to correct the code, not to catch the error.

**Example in Action**

\`\`\`java
// CHECKED — compiler insists it be handled or declared
public void readFile(String path) throws IOException {
    Files.readAllBytes(Paths.get(path));   // IOException is checked
}

// UNCHECKED — free to propagate; no 'throws' required
public int divide(int a, int b) {
    if (b == 0) throw new ArithmeticException("Division by zero");
    return a / b;
}
\`\`\`

**When to use which:**
- **Checked** — when the caller can *reasonably recover* (retry, use a fallback, show a message). Example: file not found.
- **Unchecked** — when it's a *bug* that shouldn't be silently swallowed. Example: \`NullPointerException\`, \`IllegalArgumentException\`, \`IllegalStateException\`.

**Spring's take:** Spring wraps checked data-access exceptions (like \`SQLException\`) into *unchecked* \`DataAccessException\` subclasses. The reasoning: most callers can't meaningfully recover from a SQL error, so forcing them to catch it just clutters the code.`,
        difficulty: "easy",
        tags: ["core-java", "exceptions", "error-handling"]
      },
      {
        id: "cj-4",
        question: "String vs StringBuilder vs StringBuffer — what's the difference?",
        answer: `The key fact behind this question: **\`String\` is immutable**. Once created, its characters can never change. Every "modification" (\`concat\`, \`replace\`, \`+\`) silently creates a **brand-new String object**, leaving the old one for the garbage collector.

That's fine for a few operations, but in a loop it creates a pile of throwaway objects. \`StringBuilder\` and \`StringBuffer\` fix this: they hold a **mutable** internal char array you can append to cheaply.

| | String | StringBuilder | StringBuffer |
|---|---|---|---|
| Mutable | No | **Yes** | **Yes** |
| Thread-safe | Yes (immutable) | No | Yes (synchronized) |
| Speed | Slow for repeated edits | **Fastest** | Slower (locking overhead) |
| Introduced | Java 1 | Java 5 | Java 1 |

**Example in Action**

\`\`\`java
// BAD — builds ~10,000 intermediate String objects
String s = "";
for (int i = 0; i < 10_000; i++) {
    s += i;                    // each += allocates a new String
}

// GOOD — one buffer, appended in place
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10_000; i++) {
    sb.append(i);
}
String result = sb.toString();
\`\`\`

**Rules of thumb:**
- Plain text values, map keys, constants → **String**.
- Building text in a loop or through many steps → **StringBuilder** (the default choice).
- Same, but the *same builder instance* is shared by multiple threads → **StringBuffer** (rare in practice — usually each thread builds its own).

**Interview bonus:** simple concatenations in a single expression (\`"a" + b + "c"\`) are compiled to \`StringBuilder\` (or \`invokedynamic\` in Java 9+) automatically — the manual builder only matters across loop iterations.`,
        difficulty: "easy",
        tags: ["core-java", "strings", "performance", "immutability"]
      },
      {
        id: "cj-5",
        question: "What does the final keyword do (variables, methods, classes)?",
        answer: `\`final\` means "this cannot be changed" — but *what* exactly can't change depends on where you put it.

| Used on | Effect |
|---|---|
| **Variable** | Can be assigned exactly **once** — no reassignment after that |
| **Method** | Subclasses **cannot override** it |
| **Class** | **Cannot be extended** at all (no subclasses) |

**Example in Action**

\`\`\`java
final int MAX_RETRIES = 3;
// MAX_RETRIES = 5;              // compile error — cannot reassign

final List<String> names = new ArrayList<>();
names.add("Alice");              // OK! The OBJECT is still mutable
// names = new ArrayList<>();    // compile error — the REFERENCE is final

class Parent {
    final void connect() { }     // subclasses may not override this
}

final class Config { }           // nobody can extend Config
// class MyConfig extends Config { }   // compile error
\`\`\`

**The #1 trap interviewers probe:** \`final\` on a reference variable locks the *reference*, **not the object it points to**. A \`final List\` can still be added to. If you want unchangeable contents, you need an immutable object (e.g. \`List.of(...)\`).

**Where you see it in real code:**
- Constants: \`public static final\` fields.
- \`String\`, \`Integer\`, \`LocalDate\` are \`final\` **classes** — that guarantees their immutability can't be broken by a subclass.
- Effectively-final locals are what lambdas are allowed to capture.`,
        difficulty: "easy",
        tags: ["core-java", "final", "immutability", "keywords"]
      },
      {
        id: "cj-6",
        question: "Explain the static keyword. How do static members differ from instance members?",
        answer: `\`static\` means "belongs to the **class itself**, not to any particular object." There is exactly **one copy** of a static member, shared by every instance — instance members get a fresh copy per object.

| | Instance member | Static member |
|---|---|---|
| Belongs to | Each object | The class (one shared copy) |
| Access via | \`object.field\` | \`ClassName.field\` |
| Can use \`this\`? | Yes | **No** — there is no instance |
| Memory | Heap, per object | Once per class |

**Example in Action**

\`\`\`java
class Counter {
    static int totalCreated = 0;   // shared by ALL Counter objects
    int myNumber;                  // each object has its own

    Counter() {
        totalCreated++;            // bumps the one shared counter
        myNumber = totalCreated;
    }
}

new Counter(); new Counter(); new Counter();
System.out.println(Counter.totalCreated); // 3 — accessed via the CLASS
\`\`\`

**The four places static appears:**
1. **Static fields** — shared state/constants (\`Math.PI\`).
2. **Static methods** — utilities that need no instance (\`Math.max\`, \`Collections.sort\`). They **cannot** touch instance fields or call instance methods directly — there's no \`this\` to work on.
3. **Static blocks** — run **once** when the class is loaded; used for complex constant initialization.
4. **Static nested classes** — a nested class that doesn't need a reference to the outer instance (e.g. \`Map.Entry\`).

**Interview traps:**
- Static methods are **not overridden**, they are *hidden* (resolved at compile time by reference type).
- Overusing static state makes code hard to test — which is exactly why Spring prefers injected singleton **beans** over static singletons.`,
        difficulty: "easy",
        tags: ["core-java", "static", "keywords", "memory"]
      },
      {
        id: "cj-7",
        question: "Is Java pass-by-value or pass-by-reference?",
        answer: `Java is **always pass-by-value**. No exceptions. The confusion comes from what that value *is*:

- For **primitives**, the value is the number itself — the method gets a copy of the number.
- For **objects**, the value is the **reference** (the "address") — the method gets a *copy of the reference*, and both copies point at the **same object**.

So: a method **can mutate the object** you passed (both references point to it), but it **cannot make your variable point somewhere else** (it only has a copy of your reference).

**Example in Action**

\`\`\`java
static void mutate(List<String> list) {
    list.add("added");           // works — same underlying object
}

static void reassign(List<String> list) {
    list = new ArrayList<>();    // only changes the local COPY of the reference
    list.add("lost");
}

List<String> mine = new ArrayList<>();
mutate(mine);
System.out.println(mine);        // [added]      — mutation is visible
reassign(mine);
System.out.println(mine);        // [added]      — reassignment was NOT
\`\`\`

**The mental model:** think of a reference as a slip of paper with a house address on it. Passing it to a method photocopies the slip. The method can walk to the house and repaint it (mutation — you'll see it), but scribbling a new address on *its photocopy* changes nothing for you (reassignment — invisible to the caller).

**One-line interview answer:** "Java passes everything by value; for objects, the value being copied is the reference — so callees can mutate the shared object but can't rebind the caller's variable."`,
        difficulty: "medium",
        tags: ["core-java", "pass-by-value", "references", "methods"]
      },
      {
        id: "cj-8",
        question: "What is autoboxing/unboxing, and what pitfalls come with wrapper classes?",
        answer: `Every primitive has an object **wrapper class** (\`int\` → \`Integer\`, \`double\` → \`Double\`, …). You need wrappers wherever an *object* is required — generics (\`List<Integer>\`, never \`List<int>\`), collections, and nullable fields.

**Autoboxing** = the compiler automatically converting primitive → wrapper. **Unboxing** = wrapper → primitive.

\`\`\`java
List<Integer> list = new ArrayList<>();
list.add(5);          // autoboxing:  int 5  →  Integer.valueOf(5)
int x = list.get(0);  // unboxing:    Integer →  int
\`\`\`

It looks seamless — which is exactly why the pitfalls bite.

**Pitfall 1 — \`==\` and the Integer cache.** \`Integer.valueOf\` caches values from **-128 to 127**. Inside the range you get the *same* cached object; outside it, new objects:

\`\`\`java
Integer a = 127, b = 127;
System.out.println(a == b);        // true  — both from the cache
Integer c = 128, d = 128;
System.out.println(c == d);        // false — two different objects!
System.out.println(c.equals(d));   // true  — ALWAYS compare wrappers with equals()
\`\`\`

**Pitfall 2 — NullPointerException on unboxing.** A wrapper can be \`null\`; a primitive can't:

\`\`\`java
Integer count = ordersMap.get("missing-key");  // returns null
int total = count + 1;                          // NPE! null cannot unbox
\`\`\`

**Pitfall 3 — performance in hot loops.** Each box is an object allocation:

\`\`\`java
Long sum = 0L;
for (long i = 0; i < 1_000_000; i++) sum += i;  // ~1M Long objects created
// Fix: use primitive 'long sum' — orders of magnitude faster
\`\`\`

**Takeaways:** compare wrappers with \`.equals()\`, never \`==\`; guard against \`null\` before unboxing (or use \`getOrDefault\`); prefer primitives in performance-sensitive code.`,
        difficulty: "medium",
        tags: ["core-java", "autoboxing", "wrapper-classes", "integer-cache"]
      },
      {
        id: "cj-9",
        question: "How do you create an immutable class in Java? Why is String immutable?",
        answer: `An **immutable** object can never change after construction. That single property buys you: free thread-safety (nothing to synchronize), safe use as \`HashMap\` keys (hash never changes), and no defensive copying by callers.

**The recipe (know all five steps):**
1. Declare the class \`final\` — so no subclass can add mutable behavior.
2. Make every field \`private final\`.
3. Provide **no setters** — set everything in the constructor.
4. **Defensive-copy mutable inputs** in the constructor (dates, lists, arrays).
5. **Never return internal mutable state** — return copies or unmodifiable views.

**Example in Action**

\`\`\`java
public final class Employee {                       // 1. final class
    private final String name;                      // 2. private final
    private final List<String> skills;

    public Employee(String name, List<String> skills) {
        this.name = name;
        this.skills = new ArrayList<>(skills);      // 4. copy IN
    }

    public String getName() { return name; }        // 3. no setters

    public List<String> getSkills() {
        return List.copyOf(skills);                 // 5. copy OUT
    }
}
\`\`\`

Skip step 4 or 5 and the caller can mutate your "immutable" object through the shared list — the classic interview follow-up.

**Why String is immutable — the four reasons interviewers want:**
- **String pool** — literals are shared between variables; that's only safe if nobody can change them.
- **Security** — file paths, URLs, class names are passed as Strings; a mutable String could be swapped *after* a security check.
- **Hash caching** — \`String\` caches its \`hashCode\`, making it a fast, reliable \`HashMap\` key.
- **Thread safety** — Strings can be shared across threads with zero synchronization.

**Modern shortcut:** a \`record\` (Java 16+) gives you steps 1–3 automatically — you still own the defensive copies:

\`\`\`java
public record Employee(String name, List<String> skills) {
    public Employee { skills = List.copyOf(skills); }  // compact constructor copy
}
\`\`\``,
        difficulty: "medium",
        tags: ["core-java", "immutability", "strings", "records", "thread-safety"]
      }
    ]
  },

  {
    id: "oops",
    title: "Java OOPs Concepts",
    icon: "🧩",
    questions: [
      {
        id: "oop-1",
        question: "What are the four pillars of OOP? Explain each with an example.",
        answer: `The four pillars are the foundation every other OOP question builds on. Know a one-liner *and* a concrete Java example for each.

| Pillar | One-liner | Java tool |
|---|---|---|
| **Encapsulation** | Bundle data + methods; hide the data behind a controlled interface | \`private\` fields + getters/setters |
| **Abstraction** | Expose *what* something does, hide *how* | \`interface\`, \`abstract class\` |
| **Inheritance** | A class reuses and extends another ("is-a") | \`extends\` |
| **Polymorphism** | One reference type, many runtime behaviors | overriding + dynamic dispatch |

**Example in Action** — all four in ~20 lines:

\`\`\`java
// ABSTRACTION — callers know WHAT a shape does, not HOW
abstract class Shape {
    abstract double area();
}

// INHERITANCE — Circle IS-A Shape
class Circle extends Shape {
    // ENCAPSULATION — radius is hidden; exposed via constructor only
    private final double radius;
    Circle(double radius) { this.radius = radius; }

    @Override
    double area() { return Math.PI * radius * radius; }
}

class Square extends Shape {
    private final double side;
    Square(double side) { this.side = side; }

    @Override
    double area() { return side * side; }
}

// POLYMORPHISM — same call, different behavior at runtime
List<Shape> shapes = List.of(new Circle(2), new Square(3));
for (Shape s : shapes) {
    System.out.println(s.area());   // JVM picks Circle.area() or Square.area()
}
\`\`\`

**How they connect (good closing line in an interview):** encapsulation protects state, abstraction defines contracts, inheritance shares the contract implementation, and polymorphism lets callers use any implementation through the contract without knowing which one they got — which is exactly how Spring injects an interface and swaps implementations freely.`,
        difficulty: "easy",
        tags: ["oops", "pillars", "polymorphism", "encapsulation", "inheritance", "abstraction"]
      },
      {
        id: "oop-2",
        question: "What is the difference between abstraction and encapsulation?",
        answer: `They sound similar because both "hide" something — but they hide **different things for different reasons**.

- **Abstraction** hides **complexity**: it shows the caller *what* an object can do and hides *how* it does it. It's a **design-level** idea, achieved with interfaces and abstract classes.
- **Encapsulation** hides **data**: it locks internal state behind access modifiers so it can only change through controlled methods. It's an **implementation-level** idea, achieved with \`private\` fields.

| | Abstraction | Encapsulation |
|---|---|---|
| Hides | Implementation complexity | Internal state/data |
| Question answered | *What* does it do? | *How is data protected?* |
| Achieved via | \`interface\`, \`abstract class\` | \`private\` + getters/setters |
| Level | Design | Implementation |

**Example in Action**

\`\`\`java
// ABSTRACTION: callers see only "you can pay" — not the gateway logic
interface PaymentService {
    void pay(BigDecimal amount);
}

class StripePaymentService implements PaymentService {
    // ENCAPSULATION: the key is private; nobody can read or replace it
    private final String apiKey;

    StripePaymentService(String apiKey) { this.apiKey = apiKey; }

    @Override
    public void pay(BigDecimal amount) {
        // hidden implementation details...
    }
}
\`\`\`

**The classic analogy:** a car. *Abstraction* is the steering wheel and pedals — a simple interface over a complex engine. *Encapsulation* is the sealed hood — you can't reach in and poke the engine's internals directly.

**One-liner to close:** "Abstraction hides complexity behind an interface; encapsulation hides data behind access control."`,
        difficulty: "easy",
        tags: ["oops", "abstraction", "encapsulation", "interfaces"]
      },
      {
        id: "oop-3",
        question: "Method overloading vs method overriding — what's the difference?",
        answer: `Both reuse a method *name*, but they are completely different mechanisms resolved at different times.

- **Overloading** = same name, **different parameter list**, in the **same class**. The compiler picks the right one **at compile time** by looking at the argument types → *compile-time (static) polymorphism*.
- **Overriding** = a **subclass replaces** an inherited method with the **exact same signature**. The JVM picks the version **at runtime** based on the actual object → *runtime (dynamic) polymorphism*.

| | Overloading | Overriding |
|---|---|---|
| Where | Same class | Parent → child |
| Signature | Must **differ** (params) | Must be **identical** |
| Return type | Can be anything | Same or covariant (subtype) |
| Access modifier | Anything | Cannot be **narrower** than parent's |
| Resolved | Compile time | Runtime |
| Annotation | — | \`@Override\` (always use it!) |

**Example in Action**

\`\`\`java
class Printer {
    // OVERLOADING — three methods, one name, different params
    void print(String s)  { System.out.println("text: " + s); }
    void print(int i)     { System.out.println("number: " + i); }
    void print(String s, int copies) { /* ... */ }
}

class Animal {
    void speak() { System.out.println("..."); }
}
class Dog extends Animal {
    @Override                       // OVERRIDING — same signature
    void speak() { System.out.println("Woof!"); }
}

Animal a = new Dog();
a.speak();   // "Woof!" — runtime type (Dog) decides, not reference type
\`\`\`

**Interview traps:**
- \`static\`, \`private\`, and constructors **cannot be overridden** (statics are *hidden* — see the method-hiding question). \`final\` methods can't be either.
- An override may throw **fewer/narrower checked exceptions**, never broader ones.
- Always write \`@Override\` — it turns a silent typo (accidental overload) into a compile error.`,
        difficulty: "easy",
        tags: ["oops", "overloading", "overriding", "polymorphism"]
      },
      {
        id: "oop-4",
        question: "Interface vs abstract class — differences and when to use which?",
        answer: `Both define contracts that other classes fill in, but they answer different design questions:

- An **interface** says: "anything that *can do this* — regardless of what it is." (a capability)
- An **abstract class** says: "here is a *partially built* thing — finish it." (a shared skeleton)

| | Interface | Abstract class |
|---|---|---|
| A class can have | **Many** (implements A, B, C) | Only **one** (extends) |
| State (instance fields) | No (only \`public static final\` constants) | **Yes** — full fields |
| Constructors | No | **Yes** |
| Method bodies | \`default\` / \`static\` methods (Java 8+), \`private\` (Java 9+) | Any methods |
| Member access levels | Implicitly \`public\` | \`private\` → \`public\`, anything |
| Relationship it models | "can-do" (\`Comparable\`, \`Serializable\`) | "is-a" with shared code |

**Example in Action**

\`\`\`java
// INTERFACE — a capability any class can bolt on
interface Auditable {
    void audit(String action);

    default void auditWithTime(String action) {      // Java 8+ default body
        audit(action + " at " + java.time.Instant.now());
    }
}

// ABSTRACT CLASS — shared state + a template with one hole to fill
abstract class BaseRepository {
    protected final DataSource ds;                    // shared STATE
    BaseRepository(DataSource ds) { this.ds = ds; }   // CONSTRUCTOR

    public final void save(Object entity) {           // shared logic
        validate(entity);
        // ...common persistence code
    }
    protected abstract void validate(Object entity);  // the hole
}
\`\`\`

**Decision guide:**
- Contract only, multiple unrelated implementers, or you need "multiple inheritance" of type → **interface** (the default choice in modern Java).
- Shared **fields**, constructors, or a template method with common logic → **abstract class**.

**Interview follow-up:** "Since Java 8 default methods, why still use abstract classes?" — because interfaces **still can't hold instance state or constructors**. Default methods share *behavior*, not *state*.`,
        difficulty: "medium",
        tags: ["oops", "interface", "abstract-class", "default-methods", "design"]
      },
      {
        id: "oop-5",
        question: "Why doesn't Java support multiple inheritance of classes? What is the diamond problem?",
        answer: `Java allows a class to **extend only one class** — a deliberate design choice to avoid the **diamond problem**.

**The diamond problem:** imagine class \`D\` could extend both \`B\` and \`C\`, which each override a method from their common parent \`A\`:

\`\`\`java
      A          class A { void greet() { ... } }
     / \\
    B   C        // B and C BOTH override greet() differently
     \\ /
      D          class D extends B, C { }   // ILLEGAL in Java
                 // d.greet() — B's version or C's version? Ambiguous!
\`\`\`

C++ allows this and forces developers to disambiguate manually; Java's designers chose to ban it for classes entirely.

**But interfaces? A class CAN implement many.** That was always safe for abstract methods (no bodies → no conflict). Java 8 \`default\` methods re-introduced the risk — and Java solves it with **explicit rules**:

1. **Class wins over interface** — a method inherited from a superclass always beats a default method.
2. **More specific interface wins** — if \`B extends A\`, B's default beats A's.
3. **Still ambiguous? You must override** — the compiler forces the class to resolve the conflict itself:

\`\`\`java
interface Camera {
    default void powerOn() { System.out.println("Camera on"); }
}
interface Phone {
    default void powerOn() { System.out.println("Phone on"); }
}

class SmartPhone implements Camera, Phone {
    @Override
    public void powerOn() {                 // compiler FORCES this override
        Camera.super.powerOn();             // explicitly pick one (or both)
        Phone.super.powerOn();
    }
}
\`\`\`

**One-line summary:** Java bans multiple *class* inheritance to avoid ambiguous inherited **state and behavior**; multiple *interface* inheritance is allowed because conflicts are impossible (abstract methods) or must be resolved explicitly (\`InterfaceName.super.method()\`).`,
        difficulty: "medium",
        tags: ["oops", "multiple-inheritance", "diamond-problem", "default-methods"]
      },
      {
        id: "oop-6",
        question: "Composition vs inheritance — why is composition usually preferred?",
        answer: `Two ways to reuse code:

- **Inheritance ("is-a")** — \`class Car extends Vehicle\`. Car *is a* Vehicle and inherits its behavior.
- **Composition ("has-a")** — \`class Car { private Engine engine; }\`. Car *has an* Engine and delegates to it.

The classic advice — from *Effective Java* — is **"favor composition over inheritance."** Why:

| Problem with inheritance | How composition avoids it |
|---|---|
| **Tight coupling** — child depends on parent internals; parent changes ripple down (fragile base class) | Depends only on the component's public API |
| **Locked at compile time** — you inherit everything, forever | Swap components at **runtime** (pass a different Engine) |
| **One parent max** — single inheritance is quickly "used up" | Compose as many parts as you like |
| **Leaky abstractions** — you inherit methods that make no sense for you | Expose only what you choose to delegate |

**Example in Action** — the classic broken-inheritance bug:

\`\`\`java
// BROKEN: extends HashSet to count insertions
class CountingSet<E> extends HashSet<E> {
    int count = 0;
    @Override public boolean add(E e) { count++; return super.add(e); }
    @Override public boolean addAll(Collection<? extends E> c) {
        count += c.size();
        return super.addAll(c);   // BUG: HashSet.addAll calls add() internally
    }                             // → every element counted TWICE
}

// FIXED with composition: wrap a Set, delegate explicitly
class CountingSet<E> {
    private final Set<E> inner = new HashSet<>();
    private int count = 0;

    public boolean add(E e) { count++; return inner.add(e); }
    public boolean addAll(Collection<? extends E> c) {
        boolean changed = false;
        for (E e : c) changed |= add(e);   // OUR add — counting is correct
        return changed;
    }
}
\`\`\`

**When inheritance IS right:** a genuine, stable *is-a* relationship where the subclass is a true subtype (\`ArrayList extends AbstractList\`), or framework template methods.

**Spring connection:** dependency injection is composition at framework scale — your service *has-a* repository injected, rather than extending one.`,
        difficulty: "medium",
        tags: ["oops", "composition", "inheritance", "design", "effective-java"]
      },
      {
        id: "oop-7",
        question: "What is constructor chaining? How do this() and super() work?",
        answer: `**Constructor chaining** = one constructor calling another, so object setup logic lives in exactly one place instead of being copy-pasted.

Two tools:
- **\`this(...)\`** — call *another constructor of the same class*.
- **\`super(...)\`** — call a *parent-class constructor*.

**The rules (interviewers check all four):**
1. \`this()\` / \`super()\` must be the **first statement** in a constructor — so you can use at most **one** of them per constructor.
2. If you write neither, the compiler silently inserts **\`super()\`** (no-arg).
3. If the parent has **no** no-arg constructor, you're **forced** to call \`super(args)\` explicitly — a very common compile error.
4. Chaining always runs **top-down**: \`Object\` → parent → child.

**Example in Action**

\`\`\`java
class Vehicle {
    private final String make;
    Vehicle(String make) {              // NOTE: no no-arg constructor
        this.make = make;
        System.out.println("1. Vehicle");
    }
}

class Car extends Vehicle {
    private final String model;
    private final int year;

    Car(String make, String model, int year) {
        super(make);                    // REQUIRED — parent has no no-arg ctor
        this.model = model;
        this.year = year;
        System.out.println("2. Car(full)");
    }

    Car(String make, String model) {
        this(make, model, 2025);        // chain to the full constructor
        System.out.println("3. Car(short)");
    }
}

new Car("Toyota", "Corolla");
// prints: 1. Vehicle  →  2. Car(full)  →  3. Car(short)
\`\`\`

**Why chain with \`this()\`?** One "main" constructor holds all validation/assignment; the others just fill in defaults and delegate. One place to maintain, no duplicated logic — the same idea builder patterns take further.

**Bonus trap:** never call an **overridable method** from a constructor — the child's override runs *before* the child's fields are initialized.`,
        difficulty: "easy",
        tags: ["oops", "constructors", "this", "super", "chaining"]
      },
      {
        id: "oop-8",
        question: "Can you override static or private methods in Java?",
        answer: `**No to both** — and explaining *why* is what earns the points.

**Private methods:** they're invisible to subclasses. If the child declares a method with the same name, it's simply a brand-new, unrelated method — not an override.

**Static methods:** overriding is powered by **dynamic dispatch** — the JVM picking the method based on the *object's runtime type*. Static methods don't belong to objects at all; calls are resolved **at compile time from the reference type**. Declaring the same static method in a child is called **method hiding**.

**Example in Action** — hiding vs overriding side by side:

\`\`\`java
class Parent {
    static void staticGreet()   { System.out.println("static: Parent"); }
    void instanceGreet()        { System.out.println("instance: Parent"); }
}

class Child extends Parent {
    static void staticGreet()   { System.out.println("static: Child"); }  // HIDES
    @Override
    void instanceGreet()        { System.out.println("instance: Child"); } // OVERRIDES
}

Parent p = new Child();      // reference type: Parent, object: Child

p.instanceGreet();   // "instance: Child"  — RUNTIME object type wins
p.staticGreet();     // "static: Parent"   — COMPILE-TIME reference type wins!
\`\`\`

That last line is the whole interview question in one output: the *same-looking call* behaves differently because statics never participate in polymorphism.

**Quick reference:**

| Member | Child redefines it → | Dispatch |
|---|---|---|
| Instance method | **Overriding** | Runtime object type |
| Static method | **Hiding** | Compile-time reference type |
| Private method | Unrelated new method | — |
| Fields (all) | **Hiding** (fields never override) | Compile-time reference type |

**Practical advice:** always call statics as \`ClassName.method()\`, never through a variable — it makes the compile-time binding obvious and avoids exactly this confusion. (\`@Override\` on a static won't compile, which is your safety net.)`,
        difficulty: "medium",
        tags: ["oops", "static", "method-hiding", "overriding", "polymorphism"]
      },
      {
        id: "oop-9",
        question: "Explain association, aggregation, and composition with examples.",
        answer: `All three describe "class A is connected to class B" — the difference is **ownership** and **lifecycle**. Think of it as a strength scale:

**Association (weakest)** → **Aggregation** → **Composition (strongest)**

| | Association | Aggregation | Composition |
|---|---|---|---|
| Meaning | "uses / knows" | "has-a" (shared part) | "owns" (exclusive part) |
| Ownership | None | Weak | **Strong** |
| Part outlives the whole? | Independent | **Yes** | **No — dies with it** |
| Example | Doctor ↔ Patient | Department — Professor | House — Room |

**1. Association** — objects interact; neither owns the other:

\`\`\`java
class Doctor {
    void treat(Patient p) { /* uses a Patient, doesn't keep or own it */ }
}
\`\`\`

**2. Aggregation** — whole *has* parts, but parts live independently. The giveaway: the part is **created outside and passed in**:

\`\`\`java
class Professor { }

class Department {
    private final List<Professor> professors;      // has professors...
    Department(List<Professor> professors) {       // ...but receives them
        this.professors = professors;
    }
}
// Close the department → the professors still exist (other departments, etc.)
\`\`\`

**3. Composition** — whole **creates and exclusively owns** its parts. The giveaway: the part is **instantiated inside** and never leaks out:

\`\`\`java
class House {
    private final List<Room> rooms = new ArrayList<>();
    House(int roomCount) {
        for (int i = 0; i < roomCount; i++) rooms.add(new Room());  // born inside
    }
}
// Demolish the house → its rooms are gone. A Room can't exist without its House.
\`\`\`

**How to tell them apart in code (the practical test):** ask *"if I delete the whole, do the parts survive?"* Yes → aggregation. No → composition. And *"does it even keep a field reference?"* No, just a method parameter → plain association.

**Note:** this "composition" (UML lifecycle ownership) is related to but broader than the "composition over inheritance" principle — that one is about preferring *has-a* delegation to *is-a* extension.`,
        difficulty: "medium",
        tags: ["oops", "association", "aggregation", "composition", "uml", "relationships"]
      },
      {
        id: "oop-10",
        question: "Explain the SOLID principles with Java examples.",
        answer: `SOLID is five design principles that keep object-oriented code **maintainable, testable, and safe to extend**. Interviewers usually want the name, a one-liner, and a tiny example for each.

**S — Single Responsibility Principle (SRP):** a class should have **one reason to change**.

\`\`\`java
// BAD: report logic + persistence + email in one class
class ReportService { void generate(){} void saveToDb(){} void email(){} }

// GOOD: three classes, three responsibilities
class ReportGenerator {} class ReportRepository {} class ReportMailer {}
\`\`\`

**O — Open/Closed Principle (OCP):** open for **extension**, closed for **modification** — add features with *new classes*, not by editing working code.

\`\`\`java
interface DiscountPolicy { BigDecimal apply(BigDecimal price); }
class NoDiscount implements DiscountPolicy { /* ... */ }
class BlackFriday implements DiscountPolicy { /* ... */ }
// New discount type? Add a class. Checkout code never changes.
\`\`\`

**L — Liskov Substitution Principle (LSP):** a subclass must be usable **anywhere its parent is expected** — same promises, no surprises. The classic violation:

\`\`\`java
class Rectangle { void setWidth(int w){} void setHeight(int h){} }
class Square extends Rectangle {
    // forced to make setWidth also change height → breaks Rectangle's contract
}
// Code that resizes a Rectangle silently misbehaves when handed a Square.
\`\`\`

**I — Interface Segregation Principle (ISP):** many **small, focused** interfaces beat one fat one — clients shouldn't be forced to implement methods they don't need.

\`\`\`java
// BAD: interface Machine { print(); scan(); fax(); }
// GOOD:
interface Printer { void print(); }
interface Scanner { void scan(); }
class SimplePrinter implements Printer { /* no dummy scan()/fax() */ }
\`\`\`

**D — Dependency Inversion Principle (DIP):** depend on **abstractions**, not concrete classes; high-level policy shouldn't know low-level details.

\`\`\`java
class OrderService {
    private final PaymentGateway gateway;          // interface, not StripeGateway
    OrderService(PaymentGateway gateway) {         // dependency INJECTED
        this.gateway = gateway;
    }
}
\`\`\`

**The Spring connection (great closer):** Spring is SOLID applied at framework scale — beans get **abstractions injected** (DIP), you swap implementations without touching consumers (OCP), and \`@Service\` / \`@Repository\` layering nudges you toward SRP. Mock the interface and every class is unit-testable.`,
        difficulty: "hard",
        tags: ["oops", "solid", "design-principles", "srp", "dependency-inversion"]
      }
    ]
  },

  {
    id: "collections",
    title: "Java Collections",
    icon: "📦",
    questions: [
      {
        id: "col-1",
        question: "Compare ArrayList vs LinkedList — when to use each?",
        answer: `Both are \`List\` implementations (ordered collections you access by index), but they store data very differently, and that changes which operations are fast.

- **ArrayList** is backed by a resizable **array** — one contiguous block of memory. Jumping to any index is instant, but inserting in the middle means shifting everything after it.
- **LinkedList** is a chain of **nodes**, each pointing to the next and previous. Inserting/removing is just re-linking pointers, but to reach index \`n\` you have to walk the chain from the start.

| Operation | ArrayList | LinkedList |
|---|---|---|
| Get by index | **O(1)** (instant) | O(n) (walk the chain) |
| Add/remove at the end | O(1) amortized | O(1) |
| Add/remove in the middle | O(n) (shift elements) | O(1) *once you're there* |
| Memory per element | Low (just the value) | Higher (value + 2 pointers per node) |

**Example in Action**

\`\`\`java
// ArrayList — great for fast reads and index access.
// Grows by ~1.5x when it fills up.
List<String> names = new ArrayList<>();

// LinkedList — also implements Deque, so it works as a queue/stack.
Deque<String> deque = new LinkedList<>();
\`\`\`

**Which should you pick?** In practice, **ArrayList wins almost every time**. Its contiguous memory gives far better cache performance, and its lower overhead matters. Only choose \`LinkedList\` if you have a *proven* need for constant-time insertion at the front/middle — and even then, \`ArrayDeque\` is usually a better choice for queue-like usage.`,
        difficulty: "easy",
        tags: ["collections", "list", "performance"]
      },
      {
        id: "col-2",
        question: "How does HashMap work internally? What are the key changes in Java 8?",
        answer: `A \`HashMap\` stores key-value pairs and lets you look them up in roughly **constant time**. It does this with an array of slots called **buckets**. To find where a key goes, it turns the key's \`hashCode()\` into a bucket index.

**The basic flow when you \`put\` or \`get\`:**
1. Call \`hashCode()\` on the key to get a raw hash.
2. "Spread" that hash (XOR the high bits down) so keys distribute more evenly.
3. Compute the bucket index: \`hash & (capacity - 1)\` (capacity is always a power of 2).
4. If multiple keys land in the same bucket (a *collision*), they're stored together, and \`equals()\` is used to find the exact key.

**What changed in Java 8 (the big improvement):**

| | Before Java 8 | Java 8+ |
|---|---|---|
| Collision storage | Always a linked list | Linked list, but converts to a **red-black tree** when a bucket gets big |
| Worst-case lookup | O(n) if many keys collide | O(log n) after treeification |

The tree conversion kicks in when a single bucket holds more than **8 entries** *and* total capacity is at least 64.

**Example in Action**

\`\`\`java
Map<String, Integer> map = new HashMap<>(16, 0.75f);
//                                        ↑    ↑
//                        initial capacity    load factor

// When size passes capacity * loadFactor (16 * 0.75 = 12), the map
// REHASHES: it doubles capacity and re-distributes every entry.
\`\`\`

**Important gotcha:** if you use a **mutable object as a key** and change it after inserting (so its \`hashCode\` changes), the map computes a different bucket and can no longer find the entry — it's effectively "lost." Use immutable keys (like \`String\`).`,
        difficulty: "medium",
        tags: ["collections", "hashmap", "internals", "java8"]
      },
      {
        id: "col-3",
        question: "What is the difference between HashMap, LinkedHashMap, TreeMap, and ConcurrentHashMap?",
        answer: `All four are \`Map\`s (key → value lookups), but they differ in **ordering, thread-safety, and speed**. Choosing the right one is mostly about "do I need order?" and "will multiple threads use it?"

| | HashMap | LinkedHashMap | TreeMap | ConcurrentHashMap |
|---|---|---|---|---|
| Ordering | None | Insertion (or access) order | Sorted by key | None |
| Allows null key | 1 | 1 | No | No |
| Thread-safe | No | No | No | **Yes** |
| Get/Put speed | O(1) avg | O(1) avg | O(log n) | O(1) avg |
| Best for | General purpose | Predictable iteration, LRU caches | Sorted output, range queries | Multi-threaded access |

**Quick guidance:**
- **HashMap** — your default when you just need fast lookups and don't care about order.
- **LinkedHashMap** — when iteration order matters, or to build an LRU cache.
- **TreeMap** — when you need keys sorted, or "give me everything between X and Y."
- **ConcurrentHashMap** — when many threads read/write the same map.

**Example in Action**

\`\`\`java
// LRU cache: evict the oldest entry once it grows past 100
Map<Integer, String> lru = new LinkedHashMap<>(16, 0.75f, true) {   // access-order = true
    protected boolean removeEldestEntry(Map.Entry<Integer, String> e) {
        return size() > 100;
    }
};

// Sorted map with range query
TreeMap<String, Integer> tree = new TreeMap<>();
tree.subMap("apple", "mango");        // keys from "apple" up to "mango"

// Thread-safe counter without external locking
ConcurrentHashMap<String, Long> counts = new ConcurrentHashMap<>();
counts.merge("clicks", 1L, Long::sum);   // atomic increment
\`\`\``,
        difficulty: "medium",
        tags: ["collections", "map", "concurrency", "comparison"]
      }
    ]
  },

  {
    id: "java8",
    title: "Java 8+ Features",
    icon: "🚀",
    questions: [
      {
        id: "j8-1",
        question: "What are functional interfaces and what built-in ones does Java provide?",
        answer: `A **functional interface** is simply an interface with **exactly one abstract method** (often called SAM — Single Abstract Method). This "one method" rule is what lets you implement it with a compact **lambda** or method reference instead of a whole class. It can still have \`default\` and \`static\` methods — those don't count against the one-abstract-method rule.

The \`@FunctionalInterface\` annotation is optional but recommended: it makes the compiler enforce that the interface really has just one abstract method.

\`\`\`java
@FunctionalInterface
public interface Transformer<T, R> {
    R transform(T input);                       // the single abstract method

    // default methods are allowed
    default Transformer<T, R> andLog() {
        return t -> { R r = transform(t); System.out.println(r); return r; };
    }
}
\`\`\`

**The built-in ones you'll use constantly** (from \`java.util.function\`):

| Interface | Shape | Used for |
|---|---|---|
| **Predicate<T>** | T → boolean | Filtering / conditions |
| **Function<T,R>** | T → R | Transforming a value |
| **Consumer<T>** | T → void | Doing something with a value (side effect) |
| **Supplier<T>** | () → T | Producing/lazily creating a value |
| **BiFunction<T,U,R>** | (T, U) → R | Combining two inputs |
| **UnaryOperator<T>** | T → T | Transform, same type in and out |
| **BinaryOperator<T>** | (T, T) → T | Reducing two values into one |

**Example in Action**

\`\`\`java
Predicate<String> isLong   = s -> s.length() > 10;
Function<String, Integer> length = String::length;      // method reference
Consumer<String> printer   = System.out::println;
Supplier<List<String>> listFactory = ArrayList::new;

// Compose functions: first uppercase, then take the length
Function<String, String>  upper = String::toUpperCase;
Function<String, Integer> upperLength = upper.andThen(length);
\`\`\``,
        difficulty: "medium",
        tags: ["java8", "functional", "lambda", "streams"]
      },
      {
        id: "j8-2",
        question: "Explain the Stream API — intermediate vs terminal operations, and lazy evaluation.",
        answer: `A **Stream** is a pipeline for processing a sequence of data in a readable, declarative way — you describe *what* you want (filter, map, collect) instead of writing loops. A crucial detail: streams are **lazy**. Nothing actually runs until you attach a *terminal* operation at the end.

There are two kinds of operations:

- **Intermediate** (lazy, return another Stream): they just *describe* a step and chain together. Examples: \`filter\`, \`map\`, \`flatMap\`, \`distinct\`, \`sorted\`, \`peek\`, \`limit\`, \`skip\`.
- **Terminal** (eager, produce a result and trigger the whole pipeline): Examples: \`collect\`, \`forEach\`, \`count\`, \`reduce\`, \`findFirst\`, \`anyMatch\`, \`toList\`.

**Example in Action**

\`\`\`java
List<String> result = employees.stream()
    .filter(e -> e.getDepartment().equals("Engineering"))  // intermediate
    .filter(e -> e.getSalary() > 80_000)                   // intermediate
    .map(Employee::getName)                                 // intermediate
    .sorted()                                               // intermediate
    .limit(10)                                              // intermediate
    .collect(Collectors.toList());   // TERMINAL — the pipeline runs NOW
\`\`\`

**Why laziness is powerful — short-circuiting:** because steps only run when needed, operations like \`findFirst\` can stop early instead of scanning everything.

\`\`\`java
Optional<Employee> first = employees.stream()
    .filter(e -> e.getSalary() > 100_000)
    .findFirst();   // stops at the first match — may not touch the rest

// Parallel stream: splits work across threads (ForkJoinPool.commonPool())
long count = bigList.parallelStream()
    .filter(expensive::check)
    .count();
\`\`\`

**Gotcha:** a stream can be used **only once**. Calling a second terminal operation on the same stream throws \`IllegalStateException\` — create a new stream instead.`,
        difficulty: "medium",
        tags: ["java8", "streams", "functional", "performance"]
      },
      {
        id: "j8-3",
        question: "What is Optional and how should it be used correctly?",
        answer: `\`Optional<T>\` is a small **box that may or may not contain a value**. Its whole purpose is to make "this might be missing" **explicit in the method signature**, so callers stop being surprised by \`null\` and the dreaded \`NullPointerException\`.

**Creating and consuming an Optional:**

\`\`\`java
// Creating
Optional<String> present = Optional.of("hello");            // throws if you pass null
Optional<String> maybe   = Optional.ofNullable(getValue()); // null becomes empty
Optional<String> empty   = Optional.empty();

// Consuming — prefer this pipeline style over manual if-checks
String result = maybe
    .filter(s -> s.length() > 3)
    .map(String::toUpperCase)
    .orElse("DEFAULT");            // supply a fallback if empty

// Do something only if a value is present
maybe.ifPresent(s -> System.out.println("Value: " + s));

// Java 9+: handle both cases in one call
maybe.ifPresentOrElse(
    s  -> System.out.println("Found: " + s),
    () -> System.out.println("Not found")
);
\`\`\`

**What NOT to do (common mistakes):**

\`\`\`java
// 1. Don't call get() without checking — it defeats the point
String bad = maybe.get();   // throws NoSuchElementException if empty

// 2. Don't use Optional as a method parameter or a field.
//    Use method overloads instead.
void process(Optional<String> name) { ... }   // BAD
void process(String name) { ... }             // GOOD
void process() { ... }                         // GOOD (overload)

// 3. Don't wrap collections in Optional — an empty list already means "nothing"
Optional<List<String>> bad2 = ...;   // BAD
List<String> good = ...;             // GOOD — return an empty list, not Optional
\`\`\`

**Rule of thumb:** use \`Optional\` mainly as a **return type** to signal "might be absent," and consume it with \`map\`/\`filter\`/\`orElse\` rather than \`isPresent()\` + \`get()\`.`,
        difficulty: "medium",
        tags: ["java8", "optional", "null-safety"]
      }
    ]
  },

  {
    id: "concurrency",
    title: "Multithreading & Concurrency",
    icon: "🧵",
    questions: [
      {
        id: "mc-1",
        question: "What is the difference between Thread, Runnable, and Callable?",
        answer: `These three are the building blocks for running code concurrently in Java. The easiest way to understand them is: \`Runnable\` and \`Callable\` describe a **task** (the work to do), while \`Thread\` is a **worker** that actually runs a task.

| Type | What it is | Returns a result? | Can throw checked exceptions? |
|---|---|---|---|
| **Thread** | A class representing an actual thread of execution | — | — |
| **Runnable** | A functional interface: \`void run()\` | No | No |
| **Callable<V>** | A functional interface: \`V call() throws Exception\` | **Yes** | **Yes** |

**Example in Action**

\`\`\`java
// Thread — a worker you start directly (inflexible: ties task to thread)
Thread t = new Thread(() -> System.out.println("Running"));
t.start();

// Runnable — a task with no return value
Runnable r = () -> System.out.println("Task");
ExecutorService exec = Executors.newFixedThreadPool(4);
exec.submit(r);

// Callable — a task that returns a value and may throw
Callable<Integer> c = () -> {
    Thread.sleep(100);
    return 42;
};
Future<Integer> future = exec.submit(c);
Integer result = future.get();   // blocks until the task finishes, then returns 42
\`\`\`

**Best practice:** avoid creating raw \`Thread\` objects by hand. Prefer submitting \`Runnable\`/\`Callable\` tasks to an \`ExecutorService\` (a managed thread pool), and use \`CompletableFuture\` when you need to chain async steps together. This separates *what* work runs from *how* threads are managed.`,
        difficulty: "easy",
        tags: ["concurrency", "threads", "executors"]
      },
      {
        id: "mc-2",
        question: "Explain volatile, synchronized, and the Java Memory Model.",
        answer: `When multiple threads share data, two problems appear: **visibility** (one thread's update might not be *seen* by another, because each CPU core can cache values) and **atomicity** (an operation like \`count++\` is actually several steps that can interleave). The **Java Memory Model (JMM)** defines the rules for when one thread is guaranteed to see another's changes. \`volatile\` and \`synchronized\` are the two main tools.

**volatile** — guarantees **visibility** only. A write to a \`volatile\` field is immediately visible to all threads, and it prevents certain instruction reordering. But it does **not** make compound operations atomic (so \`volatile\` won't fix \`count++\`).

\`\`\`java
// Without volatile, another thread might loop forever on a stale 'running'
private volatile boolean running = true;

public void stop() { running = false; }         // visible to the run() thread
public void run()  { while (running) { /* work */ } }
\`\`\`

**synchronized** — gives you **both visibility and atomicity** by acting as a lock (a *monitor*): only one thread can hold it at a time, so a whole block runs without interference.

\`\`\`java
public class Counter {
    private int count = 0;

    public synchronized void increment() { count++; }   // safe: only one thread at a time
    public synchronized int  get()       { return count; }

    public void decrement() {
        synchronized (this) { count--; }                // equivalent block form
    }
}
\`\`\`

**Happens-before rules** (the JMM guarantees that establish visibility):
- Unlocking a monitor happens-before the next thread locks the same monitor.
- A \`volatile\` write happens-before every later read of that same field.
- \`Thread.start()\` happens-before the started thread's code.
- A thread's actions happen-before another thread's \`Thread.join()\` returns.

**Tip:** for a simple counter, \`AtomicInteger\` is better than \`synchronized\` — it uses a lock-free CAS (Compare-And-Swap) hardware instruction, giving atomicity with less overhead.`,
        difficulty: "medium",
        tags: ["concurrency", "volatile", "synchronized", "jmm"]
      },
      {
        id: "mc-3",
        question: "What is CompletableFuture and how does it improve on Future?",
        answer: `Both represent a **result that will be ready later** (the outcome of async work). The problem with the older \`Future\` is that it's clumsy: the only way to get the result is to call \`get()\`, which *blocks* your thread until the work is done, and you can't chain steps or handle errors gracefully.

\`CompletableFuture\` (Java 8) fixes all of that. It lets you attach **non-blocking callbacks**, **chain** steps together, **combine** multiple async results, and **handle exceptions** right in the pipeline.

| | Future (Java 5) | CompletableFuture (Java 8) |
|---|---|---|
| Get the result | Blocking \`get()\` only | Non-blocking callbacks |
| Chain steps | No | Yes (\`thenApply\`, \`thenCompose\`, …) |
| Combine multiple | No | Yes (\`thenCombine\`, \`allOf\`, \`anyOf\`) |
| Handle errors | Manual | Built-in (\`exceptionally\`, \`handle\`) |

**Example in Action**

\`\`\`java
CompletableFuture<Order> future = CompletableFuture
    // Run work on a thread pool, without blocking the caller
    .supplyAsync(() -> orderService.fetch(orderId), executor)
    // Transform the result when it arrives
    .thenApply(order -> enricher.enrich(order))
    // Consume it (side effect)
    .thenAccept(order -> notifier.notify(order))
    // Recover from any failure in the chain without breaking it
    .exceptionally(ex -> {
        log.error("Failed", ex);
        return null;
    });

// Combine two independent async calls into one result
CompletableFuture<User> userF   = CompletableFuture.supplyAsync(() -> userRepo.find(id));
CompletableFuture<List<Order>> ordersF = CompletableFuture.supplyAsync(() -> orderRepo.findByUser(id));

CompletableFuture<UserProfile> profile = userF.thenCombine(
    ordersF, (user, orders) -> new UserProfile(user, orders));

// Wait for several futures at once
CompletableFuture.allOf(f1, f2, f3).join();   // all must finish
CompletableFuture.anyOf(f1, f2, f3).join();   // first one to finish
\`\`\`

**Takeaway:** use \`CompletableFuture\` whenever you have async work that needs to be *composed* — chained, combined, or given fallback behavior — instead of blocking on \`Future.get()\`.`,
        difficulty: "medium",
        tags: ["concurrency", "completablefuture", "async", "java8"]
      }
    ]
  }
];
