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
    //var input_file = require(args[0]);
}
catch(e)
{
    console.log(e);
    console.log('Could not open file ');
    
    console.log(args[0]);
    
    console.log('Could not open file ',args[0],'. File path must be relative to this directory.');
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

        console.log("Clearing bindings...");
        clearBindings(channel, () =>
        {
            console.log("Creating bindings...");
            createBindings(channel, () =>
            {
                console.log("Done");
                connection.close();
            });
        });
    });
});

function clearBindings(channel, callback)
{
    var count = microservices.length * microservices.length * event_types.length;
    const max = count;
    microservices.forEach(name =>
    {
        microservices.forEach(name2 =>
        {
            event_types.forEach(event_type =>
            {
                channel.unbindQueue(`microservice.${name}`, `publish_event.${name2}`, event_type, null, (err, ok) =>
                {
                    if(err)
                    {
                        throw err;
                    }
                    count--;
                    if(count % 100 == 0)
                    {
                        console.log('%d%', Math.round((100.0 - count / max * 100.0)));
                    }
                    if(count == 0)
                    {
                        callback();
                    }
                });
            });
        });
    });
}

function processInputData(callback)
{
    microservices.forEach(name =>
    {
        input_file[name].forEach(entry =>
        {
            entry.event_types.forEach(ev_type =>
            {
                callback(name, entry.from, ev_type);
            });
        });
    });
}

function createBindings(channel, callback)
{
    var count = 0;
    processInputData((ms_name, ms_from, ev_type) =>
    {
        count++;
    });
    const max = count;
    processInputData((ms_name, ms_from, ev_type) =>
    {
        channel.bindQueue(`microservice.${ms_name}`, `publish_event.${ms_from}`, ev_type, null, (err, ok) =>
        {
            if(err)
            {
                throw err;
            }
            count--;
            if(count % 100 == 0)
            {
                console.log('%d%', Math.round((100.0 - count / max * 100.0)));
            }
            if(count == 0)
            {
                callback();
            }
        });
    });
}
