exports = module.exports = function (app, db) {
    app.get('/user', function (request, response) {
        // 데이터베이스 요청을 수행합니다.
        db.getAll('__user__', function (results) {
            // 응답합니다.
            response.send(results);
        });
    });

    app.post('/user', function (request, response) {
        // 모듈을 추출합니다.
        var crypto = require('crypto');

        // 변수를 선언합니다.
        var login = request.param('login');
        var password = request.param('password');

        // 아이디 중복을 확인합니다.
        var isDuplicate = false;
        if (db.core.user) {
            for (var i = 0; i < db.core.user.length; i++) {
                if (db.core.user[i].login == login) {
                    isDuplicate = true;
                }
            }
        }

        if (isDuplicate) {
            // 중복: 응답합니다.
            response.send({
                status: 400,
                message: '이미 존재하는 아이디입니다.'
            });
        } else {
            // 사용 가능: 가입합니다.
            // 해시를 생성합니다.
            var shasum = crypto.createHash('sha1');
            shasum.update('SECRET' + login + '::' + password + 'SECRET');
            var hash = shasum.digest('hex');

            // 데이터베이스 요청을 수행합니다.
            db.insert('__user__', {
                login: login,
                hash: hash
            }, function (result) {
                // 응답합니다.
                response.send(result);
            });
        }
    });

    app.post('/user/login', function (request, response) {
        // 모듈을 추출합니다.
        var crypto = require('crypto');

        // 변수를 선언합니다.
        var login = request.param('login');
        var password = request.param('password');

        // 데이터베이스에서 사용자를 찾습니다.
        if (db.core().__user__) {
            for (var i = 0; i < db.core().__user__.length; i++) {
                if (db.core().__user__[i].login == login) {
                    // 해시를 생성합니다.
                    var shasum = crypto.createHash('sha1');
                    shasum.update('SECRET' + login + '::' + password + 'SECRET');
                    var hash = shasum.digest('hex');

                    // 해시를 비교합니다.
                    if (db.core().__user__[i].hash == hash) {
                        // 로그인 성공
                        request.session.me = db.core().__user__[i];
                        response.send(db.core().__user__[i]);

                        // 함수를 종료합니다.
                        return;
                    } else {
                        // 로그인 실패
                        response.send({
                            status: 400,
                            message: '비밀번호가 틀렸습니다.'
                        }, 400);

                        // 함수를 종료합니다.
                        return;
                    }

                    // 반복문을 벗어납니다.
                    break;
                }
            }
        }

        // 응답합니다.
        response.send({
            status: 400,
            message: '사용자가 없습니다.'
        }, 400);
    });

    app.get('/user/me', function (request, response) {
        // 로그인 상태 확인
        if (request.session.me) {
            response.send(request.session.me);
        } else {
            response.send({
                status: 400,
                message: '로그인 되어 있지 않습니다.'
            }, 400);
        }
    });

    app.get('/user/logout', function (request, response) {
        // 로그인 상태 확인
        if (request.session.me) {
            // 세션을 제거합니다.
            request.session.destroy();

            // 응답합니다.
            response.send({
                status: 200,
                message: '로그아웃에 성공했습니다.'
            }, 200);
        } else {
            // 응답합니다.
            response.send({
                status: 400,
                message: '로그인 되어 있지 않습니다.'
            }, 400);
        }
    });
};