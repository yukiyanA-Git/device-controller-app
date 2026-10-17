using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace InputNexus
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDir, "index_standalone.html");

                if (!File.Exists(htmlPath))
                {
                    htmlPath = Path.Combine(baseDir, "index.html");
                }

                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show("index_standalone.html が見つかりませんでした。\nアプリケーションと同じフォルダに配置してください。", "InputNexus エラー", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                // スキャン用 PowerShell スクリプトを実行して最新のPnP機器リストを出力
                string scanScript = Path.Combine(baseDir, "scan_devices.ps1");
                if (File.Exists(scanScript))
                {
                    try
                    {
                        ProcessStartInfo scanPsi = new ProcessStartInfo
                        {
                            FileName = "powershell.exe",
                            Arguments = string.Format("-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"{0}\"", scanScript),
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            WorkingDirectory = baseDir
                        };
                        using (Process proc = Process.Start(scanPsi))
                        {
                            proc.WaitForExit(2500);
                        }
                    }
                    catch { }
                }

                string edgeX86 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                string edgeX64 = Path.Combine(Environment.GetEnvironmentVariable("ProgramFiles") ?? @"C:\Program Files", @"Microsoft\Edge\Application\msedge.exe");

                string targetEdge = File.Exists(edgeX64) ? edgeX64 : (File.Exists(edgeX86) ? edgeX86 : null);

                string fileUri = "file:///" + htmlPath.Replace("\\", "/");

                ProcessStartInfo psi = new ProcessStartInfo();

                if (targetEdge != null)
                {
                    psi.FileName = targetEdge;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,850", fileUri);
                }
                else
                {
                    psi.FileName = fileUri;
                    psi.UseShellExecute = true;
                }

                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;

                if (targetEdge == null)
                {
                    psi.UseShellExecute = true;
                }

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("起動中にエラーが発生しました:\n" + ex.Message, "InputNexus エラー", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
