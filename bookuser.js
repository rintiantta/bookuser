exports = module.exports = function (app, db) {
    app.get('/user', function (request, response) {
        // �����ͺ��̽� ��û�� �����մϴ�.
        db.getAll('__user__', function (results) {
            // �����մϴ�.
            response.send(results);
        });
    });

    app.post('/user', function (request, response) {
        // ����� �����մϴ�.
        var crypto = require('crypto');

        // ������ �����մϴ�.
        var login = request.param('login');
        var password = request.param('password');

        // ���̵� �ߺ��� Ȯ���մϴ�.
        var isDuplicate = false;
        if (db.core.user) {
            for (var i = 0; i < db.core.user.length; i++) {
                if (db.core.user[i].login == login) {
                    isDuplicate = true;
                }
            }
        }

        if (isDuplicate) {
            // �ߺ�: �����մϴ�.
            response.send({
                status: 400,
                message: '�̹� �����ϴ� ���̵��Դϴ�.'
            });
        } else {
            // ��� ����: �����մϴ�.
            // �ؽø� �����մϴ�.
            var shasum = crypto.createHash('sha1');
            shasum.update('SECRET' + login + '::' + password + 'SECRET');
            var hash = shasum.digest('hex');

            // �����ͺ��̽� ��û�� �����մϴ�.
            db.insert('__user__', {
                login: login,
                hash: hash
            }, function (result) {
                // �����մϴ�.
                response.send(result);
            });
        }
    });

    app.post('/user/login', function (request, response) {
        // ����� �����մϴ�.
        var crypto = require('crypto');

        // ������ �����մϴ�.
        var login = request.param('login');
        var password = request.param('password');

        // �����ͺ��̽����� ����ڸ� ã���ϴ�.
        if (db.core().__user__) {
            for (var i = 0; i < db.core().__user__.length; i++) {
                if (db.core().__user__[i].login == login) {
                    // �ؽø� �����մϴ�.
                    var shasum = crypto.createHash('sha1');
                    shasum.update('SECRET' + login + '::' + password + 'SECRET');
                    var hash = shasum.digest('hex');

                    // �ؽø� ���մϴ�.
                    if (db.core().__user__[i].hash == hash) {
                        // �α��� ����
                        request.session.me = db.core().__user__[i];
                        response.send(db.core().__user__[i]);

                        // �Լ��� �����մϴ�.
                        return;
                    } else {
                        // �α��� ����
                        response.send({
                            status: 400,
                            message: '��й�ȣ�� Ʋ�Ƚ��ϴ�.'
                        }, 400);

                        // �Լ��� �����մϴ�.
                        return;
                    }

                    // �ݺ����� ����ϴ�.
                    break;
                }
            }
        }

        // �����մϴ�.
        response.send({
            status: 400,
            message: '����ڰ� �����ϴ�.'
        }, 400);
    });

    app.get('/user/me', function (request, response) {
        // �α��� ���� Ȯ��
        if (request.session.me) {
            response.send(request.session.me);
        } else {
            response.send({
                status: 400,
                message: '�α��� �Ǿ� ���� �ʽ��ϴ�.'
            }, 400);
        }
    });

    app.get('/user/logout', function (request, response) {
        // �α��� ���� Ȯ��
        if (request.session.me) {
            // ������ �����մϴ�.
            request.session.destroy();

            // �����մϴ�.
            response.send({
                status: 200,
                message: '�α׾ƿ��� �����߽��ϴ�.'
            }, 200);
        } else {
            // �����մϴ�.
            response.send({
                status: 400,
                message: '�α��� �Ǿ� ���� �ʽ��ϴ�.'
            }, 400);
        }
    });
};