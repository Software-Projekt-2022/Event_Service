const amqp = require('amqplib/callback_api');

const microservices = [
    'unternehmensregister',
    'authentifizierung',
    'umwelt',
    'gesundheitswesen',
    'kultur',
    'verkehr',
    'landing_page'
];

const event_types = [
    'breaking_news_created',
    'air_quality_warning_issued',
    'daily_cultural_events_published',
    'admin_message_broadcast',
    'customer_created',
    'customer_authorized',
    'customer_deleted',
    'contract_deleted',
    'contract_received',
    'crew_member_created',
    'crew_member_removed',
    'health_expert_created',
    'health_expert_removed',
    'cultural_event_started'
];

const args = process.argv.slice(2);
if(args.length == 0)
{
    console.log('Usage:\nnode app.js <input file name>');
    process.exit(-1);
}

try
{
    var input_file = require(`./${args[0]}`);
}
catch
{
    console.log(`Could not open file "${args[0]}". File path must be relative to this directory.`);
    process.exit(-1);
}

amqp.connect('amqp://localhost', (conn_err, connection) =>
{
    if (conn_err)
    {
        throw conn_err;
    }
    connection.createChannel((ch_err, channel) =>
    {
        if (ch_err)
        {
            throw ch_err;
        }

        //Clear bindings
        console.log("Clearing bindings...");
        microservices.forEach(name =>
        {
            microservices.forEach(name2 =>
            {
                event_types.forEach(event_type =>
                {
                    channel.unbindQueue(`microservice.${name}`, `publish_event.${name2}`, event_type);
                });
            });
        });

        //Create bindings
        console.log("Creating bindings...");
        microservices.forEach(name =>
        {
            input_file[name].from_microservices.forEach(from_ms_name =>
            {
                input_file[name].receive_events.forEach(receive_ev_name =>
                {
                    channel.bindQueue(`microservice.${name}`, `publish_event.${from_ms_name}`, receive_ev_name);
                });
            });
        });

        console.log("Done");
        connection.close();
    });
});
