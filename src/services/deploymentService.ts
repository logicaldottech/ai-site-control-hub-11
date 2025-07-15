
import { deployWebsite, getDeploymentStatus } from '@/api/hostingApi';
import { HostingCredential } from '@/utils/credentialManager';
import { toast } from '@/hooks/use-toast';

export interface WebsiteFiles {
  'index.html': string;
  'style.css': string;
  'script.js': string;
  [key: string]: string;
}

export class DeploymentService {
  async deployToHosting(
    credential: HostingCredential,
    domain: string,
    websiteFiles: WebsiteFiles,
    targetDirectory = 'public_html'
  ) {
    try {
      toast({
        title: "Starting deployment",
        description: `Deploying website to ${domain}...`,
      });

      // Convert website files to the expected format
      const projectFiles = Object.entries(websiteFiles).map(([path, content]) => ({
        path,
        content,
        type: 'text' as const
      }));

      const deploymentResponse = await deployWebsite({
        credentialId: credential.id,
        domain,
        projectFiles,
        deploymentConfig: {
          targetDirectory,
          backupCurrent: true,
          customCommands: [
            'chmod -R 755 .',
            'find . -type f -name "*.html" -exec chmod 644 {} \\;',
            'find . -type f -name "*.css" -exec chmod 644 {} \\;',
            'find . -type f -name "*.js" -exec chmod 644 {} \\;'
          ]
        }
      });

      return deploymentResponse;
    } catch (error) {
      console.error('Deployment service error:', error);
      toast({
        title: "Deployment failed",
        description: `Failed to deploy to ${domain}: ${error}`,
        variant: "destructive"
      });
      throw error;
    }
  }

  async monitorDeployment(deploymentId: string) {
    return await getDeploymentStatus(deploymentId);
  }

  // Generate sample website files for testing
  generateSampleWebsite(domain: string, title = 'Welcome'): WebsiteFiles {
    return {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${domain}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Welcome to ${domain}</h1>
            <p>Your website is now live!</p>
        </header>
        <main>
            <section>
                <h2>About</h2>
                <p>This website was deployed using our automated hosting service.</p>
            </section>
            <section>
                <h2>Features</h2>
                <ul>
                    <li>Fast deployment</li>
                    <li>Secure hosting</li>
                    <li>Easy management</li>
                </ul>
            </section>
        </main>
        <footer>
            <p>&copy; 2024 ${domain}. All rights reserved.</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    margin-bottom: 30px;
}

header h1 {
    color: #2c3e50;
    font-size: 3rem;
    margin-bottom: 10px;
}

header p {
    color: #7f8c8d;
    font-size: 1.2rem;
}

main {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
}

section {
    margin-bottom: 30px;
}

h2 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 2rem;
}

ul {
    list-style: none;
    padding-left: 0;
}

li {
    background: #ecf0f1;
    margin: 10px 0;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #3498db;
}

footer {
    background: rgba(255, 255, 255, 0.95);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    color: #7f8c8d;
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    header, main, footer {
        padding: 20px;
    }
}`,
      'script.js': `// Welcome animation
document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    
    // Add fade-in animation
    header.style.opacity = '0';
    main.style.opacity = '0';
    footer.style.opacity = '0';
    
    setTimeout(() => {
        header.style.transition = 'opacity 1s ease-in-out';
        header.style.opacity = '1';
    }, 200);
    
    setTimeout(() => {
        main.style.transition = 'opacity 1s ease-in-out';
        main.style.opacity = '1';
    }, 600);
    
    setTimeout(() => {
        footer.style.transition = 'opacity 1s ease-in-out';
        footer.style.opacity = '1';
    }, 1000);
    
    // Add click animation to list items
    const listItems = document.querySelectorAll('li');
    listItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    console.log('Website deployed successfully to ${domain}');
});`
    };
  }
}

export const deploymentService = new DeploymentService();
