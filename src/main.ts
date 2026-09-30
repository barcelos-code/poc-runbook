import express, {Express, Request, Response} from "express"
import fs from "fs"
import client from "prom-client";

export interface ServerConfig{
    port: number,
    lockFilePath: string,
    pidFilePath: string
}

export class WebServer {
    private readonly _app: Express;
    private readonly port: number;
    private readonly lockFilePath: string;
    private readonly pidFilePath: string;

    private readonly healthGauge = new client.Gauge({
        name: "app_health_status",
        help: "Status de saúde da aplicação (1=ok, 0=Erro)"
    })

    constructor(config: ServerConfig) {
        this._app = express();
        this.port = config.port;
        this.lockFilePath = config.lockFilePath;
        this.pidFilePath = config.pidFilePath;

        client.collectDefaultMetrics();

        this.registerPid();
        this.setupRoutes();
    }

    public get app(): Express {
        return this._app
    }

    private registerPid(): void {
        fs.writeFileSync(this.pidFilePath, process.pid.toLocaleString())
    }

    private setupRoutes(): void{
        this._app.get("/", this.handleHome.bind(this))
        this._app.get("/health", this.handleHealth.bind(this))
        this._app.get("/crash", this.handleCrash.bind(this))
        this._app.get("/metrics", this.handleMetrics.bind(this))
    }

    private handleHome(req: Request, res: Response): void{
        res.status(200).json({
            status: "online",
            reason: "Serviço operando normalmente"
        })
    }

    private handleHealth(req: Request, res: Response): void{
        if(fs.existsSync(this.lockFilePath)){
            res.status(500).json({
                status: "unhealthy",
                reason: "Lockfile detectado. Serviço instável"
            })
            return
        }
        
        this.healthGauge.set(1)
        res.status(200).json({
            status: "health",
            service: "poc runbook",
            code: 200
        })

    }

    private handleCrash(req: Request, res: Response): void{
        fs.writeFileSync(this.lockFilePath, "trava_de_erro")
        res.status(500).send("forçando queda de serviços")
    }

    private async handleMetrics(req: Request, res: Response): Promise<void>{
        if(fs.existsSync(this.lockFilePath)){
            this.healthGauge.set(0)
        } else {
            this.healthGauge.set(1)
        }

        res.set("Content-Type", client.register.contentType)
        res.end(await client.register.metrics())
    }

    public start(): void{
        this._app.listen(this.port, "0.0.0.0", ()=> {
            console.log(`Serviço iniciado na porta ${this.port}... (PID: ${process.pid})`)
        })
    }
}

if(require.main === module){
    const serverConfig: ServerConfig = {
        port: 8080,
        lockFilePath: "/tmp/my-app.lock",
        pidFilePath: "/tmp/my-app.pid"
    }

    const server = new WebServer(serverConfig)
    server.start()
}