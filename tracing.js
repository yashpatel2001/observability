const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { MongoDBInstrumentation } = require('@opentelemetry/instrumentation-mongodb');
const { ExpressInstrumentation } = require('opentelemetry-instrumentation-express');
const { trace } = require('@opentelemetry/api');

module.exports = (serviceName) => {
  const jaegerExporter = new JaegerExporter({
    serviceName: serviceName,
    endpoint: 'http://localhost:14268/api/traces',
  });

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new MongoDBInstrumentation(),
      new ExpressInstrumentation(),
    ],
    tracerProvider: provider,
  });

  return trace.getTracer(serviceName);
};
