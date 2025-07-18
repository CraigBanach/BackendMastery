job "traefik" {
  datacenters = ["dc1"]
  type        = "service"

  group "traefik" {
    count = 1

    # Define the host volume
    volume "docker_sock" {
      type   = "host"
      source = "docker_sock"
    }

    network {
      port "http" {
        static = 80
      }
      port "dashboard" {
        static = 8080
      }
    }

    task "traefik" {
      driver = "docker"

      # Mount the volume in the task
      volume_mount {
        volume      = "docker_sock"
        destination = "/var/run/docker.sock"
        read_only   = true
      }

      config {
        image = "traefik:v3.4"
        ports = ["http", "dashboard"]

        args = [
          "--api.dashboard=true",
          "--api.insecure=true",
          "--ping=true",
          "--providers.docker=true",
          "--providers.docker.exposedByDefault=false",
          "--entrypoints.web.address=:80",
          "--log.level=INFO"
        ]
      }

      resources {
        cpu    = 100
        memory = 128
      }
    }
  }
}