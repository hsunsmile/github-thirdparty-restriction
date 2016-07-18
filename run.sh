# docker rm -f sasuke
# docker rm -f sasuke_worker

docker run -d --net docker --name sasuke -h sasuke.zd-dev.com -p 9393:9393 -e GITHUB_CLIENT_SECRET -e GITHUB_CLIENT_ID -e REDIS_URL -e GITHUB_VERIFIER_SECRET xsunsmile/github-thirdparty-restriction npm run web-server
docker run -d --net docker --name sasuke_worker -h sasuke.zd-dev.com -e REDIS_URL xsunsmile/github-thirdparty-restriction npm run worker
