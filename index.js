'use strict';

var winston = module.parent.require('winston'),
    Meta = module.parent.require('./meta'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    Emailer = {};

var settings = {};

Emailer.init = function(data, callback) {
    function renderAdminPage(req, res) {
        res.render('admin/emailers/local', {});
    }

    data.router.get('/admin/emailers/local', data.middleware.admin.buildHeader, renderAdminPage);
    data.router.get('/api/admin/emailers/local', renderAdminPage);

    Meta.settings.get('emailer-local', function(err, _settings) {
        if (err) {
            return winston.error(err);
        }
        settings = _settings;
    });

    callback();
};

Emailer.send = function(data, callback) {

    var smtpConfig = {
        host: settings['emailer:local:host'],
        port: settings['emailer:local:port'],
        secure: settings['emailer:local:secure'],
        auth: {
            user: settings['emailer:local:username'],
            pass: settings['emailer:local:password'],
        },
    };
    var mailOptions = {
        from: data.from,
        to: data.to,
        html: data.html,
        text: data.plaintext,
        subject: data.subject
    };
    var transporter = nodemailer.createTransport(smtpConfig);

    transporter.sendMail(mailOptions, function(err) {
        if ( !err ) {
            winston.info('[emailer.smtp] Sent `' + data.template + '` email to uid ' + data.uid);
        } else {
            winston.warn('[emailer.smtp] Unable to send `' + data.template + '` email to uid ' + data.uid + '!');
        }
        callback(err, data);
    });
};

Emailer.admin = {
    menu: function(custom_header, callback) {
        custom_header.plugins.push({
            "route": '/emailers/local',
            "icon": 'fa-envelope-o',
            "name": 'Emailer SMTP'
        });

        callback(null, custom_header);
    }
};

module.exports = Emailer;
