"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import styles from "./clients-list.module.css";
import { MascotWidget } from "./MascotWidget";
import type { Client } from "@/lib/types";
import { ClientDialog } from "./client-dialog";
import { Button } from "./ui/button";
import { T } from "@/components/language-provider";
export function ClientsList({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="YOUR BUSINESS NETWORK" />
          </span>
          <h1>
            <T text="Clients" />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="The people and businesses you work with." />
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> <T text="New client" />
        </Button>
      </div>
      <div className={`client-grid ${styles.grid}`}>
        {clients.map((client, index) => (
          <article
            className={styles.card}
            key={client.id}
            data-tone={index % 3}
          >
            <header className={styles.identity}>
              <span className={styles.avatar} aria-hidden="true">
                {Array.from(client.name.trim())[0]}
                <span>
                  <UserRound size={11} />
                </span>
              </span>
              <div>
                <span className={styles.eyebrow}>
                  <T text="Client" />
                </span>
                <h2>{client.name}</h2>
              </div>
            </header>
            <div className={styles.contacts}>
              <div>
                <Mail size={16} aria-hidden="true" />
                <span>
                  <small>
                    <T text="Email" />
                  </small>
                  {client.email ? (
                    <a href={`mailto:${client.email}`}>{client.email}</a>
                  ) : (
                    <span className={styles.missing}>
                      <T text="No email added" />
                    </span>
                  )}
                </span>
              </div>
              <div>
                <Phone size={16} aria-hidden="true" />
                <span>
                  <small>
                    <T text="Phone" />
                  </small>
                  {client.phone ? (
                    <a href={`tel:${client.phone.replace(/[^+\d]/g, "")}`}>
                      {client.phone}
                    </a>
                  ) : (
                    <span className={styles.missing}>
                      <T text="No phone added" />
                    </span>
                  )}
                </span>
              </div>
              {client.address && (
                <div>
                  <MapPin size={16} aria-hidden="true" />
                  <span>
                    <small>
                      <T text="Address" />
                    </small>
                    <span className={styles.address}>{client.address}</span>
                  </span>
                </div>
              )}
            </div>
            <footer className={styles.footer}>
              <Link
                href={`/dashboard/invoices/new?clientId=${encodeURIComponent(client.id)}`}
              >
                <T text="Create invoice" />
                <ArrowUpRight size={16} />
              </Link>
            </footer>
          </article>
        ))}
      </div>
      {clients.length === 0 && (
        <div className="empty-state panel">
          <MascotWidget character="clients" />
          <h3>
            <T text="Your next great partnership starts here" />
          </h3>
          <p>
            <T text="Add your first client to start invoicing." />
          </p>
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> <T text="Add a client" />
          </Button>
        </div>
      )}
      <ClientDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => router.refresh()}
      />
    </>
  );
}
